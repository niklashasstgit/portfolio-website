import CameraFovDiagram from "@/components/diagrams/CameraFovDiagram";
import CalibrationWallDiagram from "@/components/diagrams/CalibrationWallDiagram";
import VtolTransitionDiagram from "@/components/diagrams/VtolTransitionDiagram";

export default function DiagramSlot({ name }: { name: string }) {
  switch (name) {
    case "camera-fov":
      return <CameraFovDiagram />;
    case "calibration-wall":
      return <CalibrationWallDiagram />;
    case "vtol-transition":
      return <VtolTransitionDiagram />;
    default:
      return null;
  }
}
