import { guarded } from "@/lib/tools/whatsapp/guard";
import { getSession } from "@/lib/tools/whatsapp/runtime";

export const dynamic = "force-dynamic";

interface DiagnoseReport {
  loggedIn: boolean;
  counts: Record<string, number>;
  hints: { openInOtherTab: boolean; useHereButton: boolean; qrLikely: boolean; loading: boolean };
  chatList?: { strategy: string; rowsWithNames: number };
  tookOverFromOtherTab?: string;
}

type WinWithScraper = {
  __WCE: { diagnose(): DiagnoseReport; clickUseHere(): string | false };
};

/**
 * Structural report on what the reader can see. Chat names are truncated to
 * two characters inside the report and no message text is included, so it is
 * safe to copy out of the page when something needs debugging.
 */
export const GET = guarded(async () => {
  const session = await getSession();
  await session.ensureScraper();
  const page = session.activePage;

  let report = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.diagnose());

  if (report.hints.useHereButton || report.hints.openInOtherTab) {
    const clicked = await page.evaluate(() =>
      (window as unknown as WinWithScraper).__WCE.clickUseHere()
    );
    if (clicked) {
      await page.waitForTimeout(3000);
      await session.ensureScraper();
      report = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.diagnose());
      report.tookOverFromOtherTab = clicked;
    }
  }

  return Response.json(report);
});
