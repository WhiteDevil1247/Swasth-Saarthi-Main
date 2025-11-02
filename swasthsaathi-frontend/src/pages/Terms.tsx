import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-6 md:p-10">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: November 2, 2025
          </p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Swasth Saathi ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Permission is granted to temporarily access the Platform for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on the Platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-destructive">IMPORTANT:</strong> Swasth Saathi is an AI-powered healthcare companion platform designed to provide general health information and assistance. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. User Accounts and Privacy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We collect and process your personal health information in accordance with our Privacy Policy. By using this Platform, you consent to such processing and you warrant that all data provided by you is accurate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Health Records</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for the accuracy and content of any health records, medical documents, or information you upload to the Platform. We provide storage and management tools but do not verify the accuracy of user-submitted content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. AI Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our AI-powered features, including the health companion and symptom analysis, are provided "as is" and should be used for informational purposes only. AI-generated responses may contain errors or inaccuracies and should not be relied upon for medical decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Teleconsultation Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you use our teleconsultation services, you agree to provide accurate information to healthcare professionals. The Platform acts as a facilitator and is not responsible for the quality of medical services provided by third-party healthcare professionals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Emergency Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-destructive">IN CASE OF EMERGENCY:</strong> Do not rely on this Platform for emergency medical services. Always call your local emergency number (such as 911, 112, or 108) immediately if you are experiencing a medical emergency.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform may contain links to third-party websites or services (hospitals, NGOs, pharmacies, etc.) that are not owned or controlled by Swasth Saathi. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Swasth Saathi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Platform, even if Swasth Saathi or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Swasth Saathi may revise these terms of service at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through the Platform's support channels.
              </p>
            </section>

            <div className="mt-10 p-6 bg-muted rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Acceptance</h3>
              <p className="text-sm text-muted-foreground">
                By creating an account or using Swasth Saathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
