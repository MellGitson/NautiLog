import semiRigide from './boat-semirigide.webp'
import semiRigide2 from './boat-semirigide2.jpeg'
import flybridge from './flybridges-vedettes.jpg'
import fisherman from './yatch-fisherman.avif'
import fisherman2 from './yatch-fisherman-2.avif'

const PHOTOS_PAR_TYPE = {
  Vedette: [flybridge, semiRigide2],
  Voilier: [fisherman, fisherman2],
  Zodiac: [semiRigide, semiRigide2],
  'Bateau de pêche': [fisherman, fisherman2],
}

const PHOTO_DEFAUT = flybridge

export function photoBateau(bateau) {
  const photos = PHOTOS_PAR_TYPE[bateau.type]
  if (!photos) return PHOTO_DEFAUT
  return photos[bateau.id % photos.length]
}
