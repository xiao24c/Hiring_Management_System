import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, Card } from "antd";
import RegistrationTokenPanel from "./RegistrationTokenPanel";
import OnboardingReviewPanel from "./OnboardingReviewPanel";

const { TabPane } = Tabs;

export default function HiringManagementPage() {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("tokens");
  const [onboardingTab, setOnboardingTab] = useState("pending");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveKey(location.state.activeTab);
    }
    if (location.state?.onboardingStatusTab) {
      setOnboardingTab(location.state.onboardingStatusTab);
    }
  }, [location.state]);

  return (
    <Card>
      <Tabs
        activeKey={activeKey}
        onChange={(k) => setActiveKey(k)}
      >
        <TabPane tab="Registration Tokens" key="tokens">
          <RegistrationTokenPanel />
        </TabPane>

        <TabPane tab="Onboarding Applications" key="onboarding">
          <OnboardingReviewPanel
            initialStatusTab={onboardingTab}
            onStatusTabChange={setOnboardingTab}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
}
