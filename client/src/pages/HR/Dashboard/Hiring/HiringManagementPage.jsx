import { Tabs, Card } from "antd";
import RegistrationTokenPanel from "./RegistrationTokenPanel";
import OnboardingReviewPanel from "./OnboardingReviewPanel";

const { TabPane } = Tabs;

export default function HiringManagementPage() {
  return (
    <Card>
      <Tabs defaultActiveKey="tokens">
        <TabPane tab="Registration Tokens" key="tokens">
          <RegistrationTokenPanel />
        </TabPane>

        <TabPane tab="Onboarding Applications" key="onboarding">
          <OnboardingReviewPanel />
        </TabPane>
      </Tabs>
    </Card>
  );
}