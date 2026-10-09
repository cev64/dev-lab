# Needs Charlie

Short list of things only Charlie can do. Newest first; the nightly run keeps it current.

- [ ] Merge the clip-engine branch `claude/sweet-mendel-glnm0v` into main (GitHub -> Pull requests -> New ->
      compare `claude/sweet-mendel-glnm0v`). Until then the nightly run works from that branch, which is fine.
- [ ] Where your clips arrive: the nightly run sends the MP4s + post copy as files in its session (tap the push
      notification), and also pushes them to branch `videos/<date>` on GitHub (repo -> branches -> file -> download).
- [ ] Create the TikTok and Instagram accounts (bio idea: "Daily AI clips from the biggest podcasts"). Post the
      nightly clips using the captions in `deliveries/<date>.md`.
- [ ] Once a week, add a row per posted clip to `ops/PERFORMANCE.md` (views, avg watch %, shares). This is how the
      agent learns what works for your audience.
- [ ] Optional, lowers risk: email shows for clip permission (Lex Fridman, Dwarkesh, 20VC, No Priors, Big Technology
      first). Paste replies into `config/sources.json` notes or tell the agent.
- [ ] Know the risk: clips of other people's podcasts can get takedowns and won't earn TikTok Creator Rewards (that
      program wants original content). The original-content track in the backlog is the monetizable path.
