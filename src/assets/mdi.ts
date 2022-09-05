import { mdiVideo, mdiMapMarker } from "@mdi/js";

interface MdiIconsMapping {
  [name: string]: string;
}

const mdi: MdiIconsMapping = {
  zoom: mdiVideo,
  location: mdiMapMarker,
};

export default mdi;
