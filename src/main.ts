import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import { Application } from "pixi.js";
import { AssetLoader } from "./engine/assets/asset-loader";
import { Navigation } from "./engine/navigation/navigation";
import { Engine } from "./engine/engine";
import { LoadingScreen } from "./game/screens/loading-screen";
import { MenuScreen } from "./game/screens/menu-screen";
import { Sound } from "./engine/sound/sound";
import { StorageService } from "./game/service/storage-service";

gsap.registerPlugin(MotionPathPlugin);

async function main() {
  const application = new Application();
  await application.init({
    resolution: Math.max(window.devicePixelRatio, 2),
    backgroundColor: 0x000000,
  });

  const assetLoader = new AssetLoader();
  await assetLoader.init();

  const sound = new Sound(new StorageService());

  const navigation = new Navigation(assetLoader, sound);
  navigation.setLoadScreen(LoadingScreen);

  const engine = new Engine(application, navigation, sound);

  await engine.getNavigation().navigate(MenuScreen);
}

main();
