import Link from "next/link";
import { ArrowLeft, ShieldCheck, Fingerprint } from "lucide-react";
import { OtherCollegeLogin } from "@/components/auth/other-college-login";

const montgomeryCollegeLoginUrl =
  "https://mymclogin.glb.montgomerycollege.edu/authenticationendpoint/login.do?RelayState=eyJ0ZW5hbnRJZCI6Ijg4M2ZmNDhjLTkwOTItNGYxZi05NGY4LWMzODY4ODlhNzM1NSIsImFjY291bnRJZCI6IjAwMUcwMDAwMDBpSG4zZklBQyIsImp3dENhbGxiYWNrVXJsIjoiaHR0cHM6Ly9leHBlcmllbmNlLmVsbHVjaWFuY2xvdWQuY29tL21jODI1L2F1dGgvY2FsbGJhY2s%2Fc2lkPVMyNW9pTThnN3VqRld1R1hJcHlCYmE2eEF1amROQVNFIiwiaWRwTG9nb3V0VXJsIjoiaHR0cHM6Ly9leHBlcmllbmNlLmVsbHVjaWFuY2xvdWQuY29tL2lkcC1sb2dvdXQiLCJ0b2tlblZlcnNpb24iOiIxLjEuMCJ9&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=Be7M8BeRY1wQeE619S5yJ4t5IQa%2BvKHsPKQSLKDVAuBaIo6SojYH66U%2BTT7Vo3a9fthoedp6H9icmmwz3TBZFbXxexUr18hg7u3dYLdurqAfleC2R3Ca3nhmrWe%2FhEcgBnE5yQdKvymJclbBs%2B5CcXvlQV8qqZh3rlLVAd%2B04USPrjAesAlMk5HTCWYdj7%2Fxmn%2F4ydzHV78BnxbomSYKIGKBCMUksUtbTI5%2BA3HMQDf7aRt%2Bx3go4IMGtMY8VQ2Pi9SuZIx4JBoYuMLtMUp59mnq1MPQ51%2F6LpQiUqZN5Yl1O3ekn74AfHdxaqc8KVL%2B4ooToyYWF8RD%2Bc3xXkeQsQ%3D%3D&commonAuthCallerPath=%2Fsamlsso&forceAuth=false&passiveAuth=false&spEntityID=EthosExperience&tenantDomain=carbon.super&sessionDataKey=5cb4ef0d-6a95-4422-9c73-8634bb912af9&relyingParty=EthosExperience&type=samlsso&sp=EthosExperience&isSaaSApp=false&authenticators=BasicAuthenticator:LOCAL";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Ambience */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-all hover:-translate-x-1"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-white">
          <div className="text-center mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 text-[var(--primary)] mb-6 shadow-inner border border-purple-100/50">
              <Fingerprint size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-500 font-light leading-relaxed">
              Authenticate via your institutional portal to access the Raptor Connect dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <a
              href={montgomeryCollegeLoginUrl}
              className="w-full h-16 rounded-2xl border-2 border-transparent bg-gray-900 flex items-center justify-center gap-3 px-6 text-base font-bold text-white hover:bg-[var(--primary)] hover:shadow-xl hover:shadow-[var(--primary)]/20 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="h-6 w-6 rounded bg-white/20 flex items-center justify-center text-white text-[10px] font-black tracking-wider">
                MC
              </div>
              Login with Montgomery College
            </a>

            <OtherCollegeLogin />
          </div>

          <div className="mt-12 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-start gap-4">
            <ShieldCheck size={20} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Your session is secured by AES-256 encryption. Raptor Connect never stores your raw institutional credentials.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Not a student yet? <Link href="/" className="text-[var(--primary)] hover:text-purple-700 transition-colors underline underline-offset-4">Learn more about the platform</Link>
        </p>
      </div>
    </div>
  );
}
