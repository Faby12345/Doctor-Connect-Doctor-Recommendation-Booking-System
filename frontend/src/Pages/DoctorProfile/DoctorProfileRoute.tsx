
import { useParams } from "react-router-dom";
import DoctorProfile_outside from "./DoctorProfilePage_outside";

export default function DoctorProfileRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Missing doctor id.</div>;
  return <DoctorProfile_outside id={id} />;
}
