import Link from "next/link";
import LoginForm from "./form";
export default function Login() {
  return <main className="cms-login"><p className="cms-muted">LURING INVITE / CMS</p><div className="cms-card"><h1>Welcome back</h1><p className="cms-muted">Sign in to manage your website.</p><LoginForm /></div><Link href="/">← Back to website</Link></main>;
}
