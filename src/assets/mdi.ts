import { mdiVideo, mdiMapMarker, mdiChevronRight } from "@mdi/js";

interface MdiIconsMapping {
  [name: string]: string;
}

const mdi: MdiIconsMapping = {
  zoom: mdiVideo,
  location: mdiMapMarker,
  arrowRight: mdiChevronRight,
};

export default mdi;
