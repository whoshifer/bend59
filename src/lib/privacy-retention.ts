import { lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { analyticsDaily, consentEvents } from "@/lib/db/schema";

export function getRetentionCutoffs(retentionDays: number, now = new Date()) {
  const consentCutoff = new Date(now);
  consentCutoff.setUTCDate(consentCutoff.getUTCDate() - retentionDays);

  const analyticsCutoff = new Date(now);
  analyticsCutoff.setUTCDate(analyticsCutoff.getUTCDate() - retentionDays);

  return {
    consentCutoff,
    analyticsCutoffDay: analyticsCutoff.toISOString().slice(0, 10),
  };
}

export async function purgeExpiredPrivacyData(retentionDays: number) {
  const { consentCutoff, analyticsCutoffDay } = getRetentionCutoffs(retentionDays);

  return db.transaction(async (tx) => {
    const deletedConsents = await tx
      .delete(consentEvents)
      .where(lt(consentEvents.createdAt, consentCutoff))
      .returning({ id: consentEvents.id });
    const deletedAnalytics = await tx
      .delete(analyticsDaily)
      .where(lt(analyticsDaily.day, analyticsCutoffDay))
      .returning({ id: analyticsDaily.id });

    return {
      consentEvents: deletedConsents.length,
      analyticsDaily: deletedAnalytics.length,
    };
  });
}
