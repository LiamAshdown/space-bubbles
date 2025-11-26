import { Assets, extensions, resolveJsonUrl } from "pixi.js";
import type { ProgressCallback } from "pixi.js";

import manifest from "../../manifest.json";

extensions.add(resolveJsonUrl);

export class AssetLoader {
  private _manifest = manifest;
  private _loadedBundles: Map<string, unknown> = new Map();
  private _basePath: string;

  constructor(basePath: string = "assets") {
    this._basePath = basePath;
  }

  public async init() {
    await Assets.init({
      manifest: this._manifest,
      basePath: this._basePath,
    });

    // Preload the loading screen and default assets
    await this.loadBundles(["preload", "default", "sounds"]);
  }

  public async loadBundles(bundles: string | string[], onProgress?: ProgressCallback) {
    const bundleList = Array.isArray(bundles) ? bundles : [bundles];

    for (const bundle of bundleList) {
      if (this._loadedBundles.has(bundle)) {
        continue;
      }

      await Assets.loadBundle(bundle, onProgress);
      this._loadedBundles.set(bundle, bundle);
    }
  }

  public areBundlesLoaded(bundles: string[]) {
    return bundles.every((bundle) => this._loadedBundles.has(bundle));
  }

  public getBundledAsset(bundle: string) {
    const bundleInfo = this._manifest.bundles.find((b) => b.name === bundle);
    if (!bundleInfo) {
      throw new Error(`Bundle "${bundle}" not found in manifest.`);
    }

    return bundleInfo.assets;
  }
}
