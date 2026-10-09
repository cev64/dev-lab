import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// nflverse publishes weekly stats overnight after games; refresh twice a day (UTC).
crons.cron("nfl refresh morning", "15 9 * * *", internal.refresh.nfl, {});
crons.cron("nfl refresh evening", "15 21 * * *", internal.refresh.nfl, {});
crons.cron("analytics rollup", "5 0 * * *", internal.events.rollup, {});
crons.cron("analytics prune", "35 0 * * *", internal.events.prune, {});
crons.cron("rate limit prune", "45 0 * * *", internal.rateLimit.prune, {});

export default crons;
