import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CookieConsent } from "@/components/site/cookie-consent";
import { getCookieSettings } from "@/lib/site-data";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Электрические полотенцесушители для объектов — BEND, Пермь",
    template: "%s — BEND",
  },
  description:
    "Электрические полотенцесушители BEND из нержавеющей стали для застройщиков и электромонтажных организаций. Каталог 36 моделей, сертификаты, заявка на коммерческое предложение.",
  keywords: [
    "электрические полотенцесушители",
    "полотенцесушители оптом",
    "полотенцесушители от производителя",
    "полотенцесушители Пермь",
    "полотенцесушители для застройщиков",
    "нержавеющие полотенцесушители",
  ],
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieSettings = await getCookieSettings();

  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Перейти к содержимому</a>
        {children}
        <CookieConsent
          title={cookieSettings.bannerTitle}
          text={cookieSettings.bannerText}
          acceptLabel={cookieSettings.acceptLabel}
          rejectLabel={cookieSettings.rejectLabel}
          policyHref={cookieSettings.policyHref}
          analyticsEnabled={cookieSettings.analyticsEnabled}
        />
      </body>
    </html>
  );
}
