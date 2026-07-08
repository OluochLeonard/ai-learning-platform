import QuizFunnel from "./QuizFunnel";

export const metadata = { title: "Find your AI path" };

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; utm_campaign?: string }>;
}) {
  const { utm_source, utm_campaign } = await searchParams;

  return (
    <QuizFunnel
      utmSource={utm_source ?? null}
      utmCampaign={utm_campaign ?? null}
    />
  );
}
