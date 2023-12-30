import {
  mdiVideo,
  mdiMapMarker,
  mdiChevronRight,
  mdiLock,
  mdiLockOpen,
  mdiClose
} from '@mdi/js'

interface MdiIconsMapping {
  [name: string]: string
}

const mdi: MdiIconsMapping = {
  zoom: mdiVideo,
  location: mdiMapMarker,
  arrowRight: mdiChevronRight,
  lock: mdiLock,
  lockOpen: mdiLockOpen,
  close: mdiClose
}

export default mdi
