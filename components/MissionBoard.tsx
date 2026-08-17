"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import type {Mission} from "@/data/missions";
const filters=["all","surface","observatory","cruise","frontier"] as const;
export default function MissionBoard({missions}:{missions:Mission[]}){
 const [filter,setFilter]=useState<(typeof filters)[number]>("all");
 const visible=useMemo(()=>missions.filter(m=>filter==="all"||m.category===filter),[filter,missions]);
 return <><div className="controls">{filters.map(item=><button key={item} className={`chip ${filter===item?"on":""}`} onClick={()=>setFilter(item)}>{item==="all"?"All":item[0].toUpperCase()+item.slice(1)}</button>)}</div><div className="missions">{visible.map(m=><article className={`mission ${m.accent}`} key={m.slug}><div className="media"><div className="tag">{m.region}</div><div className="orb"/></div><div className="missionBody"><div className="row"><div><div className="name">{m.name}</div><div className="agency">{m.agency} • {m.region}</div></div><div className="status">● {m.status}</div></div><div className="stats">{m.stats.map(s=><div className="stat" key={s.label}><div className="statKey">{s.label}</div><div className="statValue">{s.value}</div></div>)}</div><div className="ai"><b>AI READ</b> {m.aiRead}</div><div className="links"><Link className="btn internal" href={`/missions/${m.slug}`}>Mission terminal</Link>{m.links.slice(0,2).map(l=><a className={`btn ${l.primary?"primary":""}`} href={l.href} target="_blank" rel="noreferrer" key={l.href}>{l.label} ↗</a>)}</div></div></article>)}</div></>
}
