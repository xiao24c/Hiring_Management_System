import { Card } from "antd";
import { useParams } from "react-router-dom";

export default function StepDetail() {
  const { step } = useParams();

  return (
    <Card title={`Visa Step: ${step}`}>
      <p>This page will handle file upload and HR feedback.</p>
    </Card>
  );
}