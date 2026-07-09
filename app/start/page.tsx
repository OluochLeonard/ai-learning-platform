import QuizFunnel from "./QuizFunnel";

export const metadata = { title: "Find your AI path" };

// Static page: the quiz reads utm_* from the URL client-side at submit
// time, so no server rendering is needed per request.
export default function StartPage() {
  return <QuizFunnel />;
}