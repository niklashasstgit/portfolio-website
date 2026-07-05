import CameraFovDiagram from "@/components/diagrams/CameraFovDiagram";
import CalibrationWallDiagram from "@/components/diagrams/CalibrationWallDiagram";

export default function DiagramSlot({ name }: { name: string }) {
  switch (name) {
    case "camera-fov":
      return <CameraFovDiagram />;
    case "calibration-wall":
      return <CalibrationWallDiagram />;
    default:
      return null;
  }
}
