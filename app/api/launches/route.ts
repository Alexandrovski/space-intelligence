import {NextResponse} from "next/server";

export const revalidate = 900;

type LaunchLibraryItem = {
  id: string;
  name: string;
  url?: string;
  net: string;
  window_start?: string;
  window_end?: string;
  last_updated?: string;
  probability?: number | null;
  weather_concerns?: string | null;
  status?: {name?: string; abbrev?: string; description?: string};
  net_precision?: {name?: string; abbrev?: string};
  image?: {image_url?: string; thumbnail_url?: string; credit?: string | null};
  launch_service_provider?: {name?: string; abbrev?: string};
  rocket?: {configuration?: {full_name?: string; name?: string; variant?: string}};
  mission?: {
    name?: string;
    type?: string;
    description?: string;
    orbit?: {name?: string; abbrev?: string};
    info_urls?: Array<{url?: string}>;
    vid_urls?: Array<{url?: string}>;
  };
  pad?: {
    name?: string;
    latitude?: number | null;
    longitude?: number | null;
    map_url?: string | null;
    location?: {name?: string; timezone_name?: string};
  };
};

const SOURCE_BY_OPERATOR: Array<{match: RegExp; mission: string; watch: string}> = [
  {match:/SpaceX/i, mission:"https://www.spacex.com/launches/", watch:"https://www.youtube.com/@SpaceX"},
  {match:/Blue Origin/i, mission:"https://www.blueorigin.com/missions", watch:"https://www.youtube.com/@blueorigin"},
  {match:/Rocket Lab/i, mission:"https://www.rocketlabusa.com/missions/next-mission/", watch:"https://www.youtube.com/@RocketLabNZ"},
  {match:/Arianespace/i, mission:"https://www.arianespace.com/missions/", watch:"https://www.youtube.com/@arianespace"},
  {match:/United Launch Alliance|ULA/i, mission:"https://www.ulalaunch.com/missions/next-launch", watch:"https://www.youtube.com/@ulalaunch"},
  {match:/China Aerospace|CASC/i, mission:"https://www.cnsa.gov.cn/english/", watch:"https://www.youtube.com/results?search_query=CNSA+launch"},
  {match:/LandSpace/i, mission:"https://www.landspace.com/", watch:"https://www.youtube.com/results?search_query=LandSpace+Zhuque+launch"},
  {match:/Roscosmos/i, mission:"https://www.roscosmos.ru/", watch:"https://www.youtube.com/results?search_query=Roscosmos+launch"},
];

function operatorLinks(operator: string, fallback: string) {
  const source = SOURCE_BY_OPERATOR.find(item => item.match.test(operator));
  return source || {mission:fallback, watch:"https://www.youtube.com/results?search_query=space+launch+live"};
}

function confidenceFor(precision: string) {
  if(/minute/i.test(precision)) return {label:"High", detail:"T-0 is precise to the minute"};
  if(/hour/i.test(precision)) return {label:"Medium", detail:"Launch time is precise to the hour"};
  if(/day/i.test(precision)) return {label:"Developing", detail:"Only a launch day is currently public"};
  return {label:"Planning", detail:"Date remains a planning placeholder"};
}

function signalScore(item: LaunchLibraryItem) {
  const type = item.mission?.type || "";
  const combined = `${item.name} ${type}`;
  let score = 58;
  if(/human|crewed/i.test(combined)) score = 100;
  else if(/planetary|lunar|moon|mars|asteroid|comet/i.test(combined)) score = 96;
  else if(/astrophysics|telescope|observatory/i.test(combined)) score = 94;
  else if(/test flight|maiden|demo flight/i.test(combined)) score = 88;
  else if(/resupply/i.test(combined)) score = 76;
  else if(/earth science|weather/i.test(combined)) score = 72;
  else if(/government|secret|national security/i.test(combined)) score = 68;
  else if(/communications/i.test(combined)) score = 52;
  if(/Falcon Heavy|New Glenn|Starship|Neutron|Vulcan/i.test(combined)) score += 5;
  if(/Starlink/i.test(combined)) score = 28;
  return Math.min(100, score);
}

function signalLabel(score: number) {
  if(score >= 94) return "Landmark";
  if(score >= 82) return "High signal";
  if(score >= 65) return "Notable";
  return score < 40 ? "Routine" : "Track";
}

function whyItMatters(item: LaunchLibraryItem) {
  const type = item.mission?.type || "mission";
  const name = item.mission?.name || item.name;
  if(/Starlink/i.test(item.name)) return "A routine constellation deployment. The intelligence signal is cadence, pad turnaround, and booster reuse rather than the individual payload batch.";
  if(/test flight|demo flight/i.test(type)) return `${name} is a vehicle-development flight. Watch whether the rocket reaches its target orbit and which recovery or reuse milestones it attempts.`;
  if(/planetary|lunar/i.test(type)) return `${name} extends launch activity beyond Earth orbit. The important handoff is not just liftoff, but accurate injection onto the mission's interplanetary or lunar trajectory.`;
  if(/astrophysics/i.test(type)) return `${name} carries an observatory whose science return depends on a clean ride and precise delivery to its operational orbit.`;
  if(/earth science/i.test(type)) return `${name} adds new observing capability for Earth's atmosphere, weather, land, or oceans; payload deployment is the decisive mission milestone.`;
  if(/resupply/i.test(type)) return `${name} is part of the operating infrastructure of human spaceflight, moving cargo and experiments to an occupied orbital outpost.`;
  return `${name} is a ${type.toLowerCase()} mission. Watch the payload destination, insertion accuracy, and whether any reusable stage returns successfully.`;
}

export async function GET() {
  try {
    const response = await fetch(
      "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=60&mode=normal&ordering=net",
      {headers:{Accept:"application/json"}, next:{revalidate:900}},
    );
    if(!response.ok) throw new Error(`Launch Library returned ${response.status}`);
    const payload = await response.json() as {results?: LaunchLibraryItem[]};
    const now = Date.now() - 60 * 60 * 1000;
    const horizon = Date.now() + 31 * 24 * 60 * 60 * 1000;
    const launches = (payload.results || [])
      .filter(item => {
        const net = Date.parse(item.net);
        return Number.isFinite(net) && net >= now && net <= horizon;
      })
      .map(item => {
        const operator = item.launch_service_provider?.name || "Unknown operator";
        const precision = item.net_precision?.name || "Unknown";
        const score = signalScore(item);
        const fallback = item.mission?.info_urls?.find(link => link.url)?.url || item.url || "https://ll.thespacedevs.com/";
        const links = operatorLinks(operator, fallback);
        return {
          id:item.id,
          name:item.name,
          mission:item.mission?.name || item.name.split("|").pop()?.trim() || item.name,
          missionType:item.mission?.type || "Unclassified",
          description:item.mission?.description || "Mission details are still developing.",
          orbit:item.mission?.orbit?.abbrev || item.mission?.orbit?.name || "TBD",
          net:item.net,
          windowStart:item.window_start || item.net,
          windowEnd:item.window_end || item.net,
          lastUpdated:item.last_updated || null,
          precision,
          confidence:confidenceFor(precision),
          status:item.status?.abbrev || item.status?.name || "TBD",
          statusDetail:item.status?.description || "Schedule status is still developing.",
          probability:item.probability ?? null,
          weatherConcerns:item.weather_concerns || null,
          operator,
          operatorAbbrev:item.launch_service_provider?.abbrev || operator,
          vehicle:item.rocket?.configuration?.full_name || item.rocket?.configuration?.name || "Vehicle TBD",
          pad:item.pad?.name || "Pad TBD",
          location:item.pad?.location?.name || "Location TBD",
          timezone:item.pad?.location?.timezone_name || "UTC",
          mapUrl:item.pad?.map_url || null,
          image:item.image?.image_url || item.image?.thumbnail_url || null,
          imageCredit:item.image?.credit || operator,
          sourceUrl:links.mission,
          webcastUrl:item.mission?.vid_urls?.find(link => link.url)?.url || links.watch,
          routine:/Starlink/i.test(item.name),
          score,
          signal:signalLabel(score),
          why:whyItMatters(item),
        };
      });

    return NextResponse.json({
      generatedAt:new Date().toISOString(),
      source:"Launch Library 2 with official operator overlays",
      launches,
      summary:{
        launchCount:launches.length,
        routineCount:launches.filter(item => item.routine).length,
        highSignalCount:launches.filter(item => item.score >= 82).length,
      },
    }, {headers:{"Cache-Control":"public, s-maxage=900, stale-while-revalidate=3600"}});
  } catch(error) {
    return NextResponse.json({error:"Launch schedule unavailable", detail:error instanceof Error ? error.message : String(error)}, {status:502});
  }
}
