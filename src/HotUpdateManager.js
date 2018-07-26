var HotUpdateManager = {

	manager: null,

	storagePath: "",

	isLoaded: false,

	updateListener: null,

	init: function (manifestUrl, storagePath) {
		//default search paths = ["assets/"] - jsb.fileUtils.getSearchPaths();
		//set custom search paths - jsb.fileUtils.setSearchPaths(["assets/res"]);

		//set writable storage path to save downloaded assets
		this.storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + storagePath);

		this.versionCompareHandle = function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
		};
		
		// create assets manager object
		this.manager = new jsb.AssetsManager(manifestUrl, this.storagePath);
		console.log("AssetsManager Init");
	
		if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
			this.manager.retain();
		}

		if (this.manager.getLocalManifest().isLoaded()) {
			this.updateListener = new jsb.EventListenerAssetsManager(this.manager, this.updateCb.bind(this));
			cc.eventManager.addListener(this.updateListener, 1);
			this.isLoaded = true;
		} else {
			this.cleanUp();
			console.log("AssetsManager:: Local Manifest not found.");
		}
	},

	updateCb: function (event) {
		switch (event.getEventCode()) {
			case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
				cc.log("No local manifest file found, skip assets update.");
				break;
			case jsb.EventAssetsManager.UPDATE_PROGRESSION:
				var percent = event.getPercent();
				var filePercent = event.getPercentByFile();
				cc.log("Download percent : " + percent + " | File percent : " + filePercent);

				var scene = cc.director.getRunningScene();
				scene.updateStatus("Download percent : " + percent + " | File percent : " + filePercent, 0);
				break;
			case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
			case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
				cc.log("Fail to download manifest file, update skipped.");
				break;
			case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
				cc.log("already up to date");
				this.cleanUp();

				var scene = cc.director.getRunningScene();
				scene.updateStatus("already up to date", 0);
				break;
			case jsb.EventAssetsManager.UPDATE_FINISHED:
				cc.log("Update finished.");
				// You need to release the assets manager while you are sure you don't need it any more
				// this.manager.release();
				
				var searchPaths = jsb.fileUtils.getSearchPaths();
				var newPaths = this.manager.getLocalManifest().getSearchPaths();
				Array.prototype.unshift(searchPaths, newPaths);
				cc.log("searchPaths::", searchPaths);
				// This value will be retrieved and appended to the default search path during game startup,
				// please refer to samples/js-tests/main.js for detailed usage.
				// !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
				cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
				jsb.fileUtils.setSearchPaths(searchPaths);

				this.cleanUp();
				//cc.audioEngine.stopAll();
				var scene = cc.director.getRunningScene();
				scene.updateStatus("Update finished.", 1);

				break;
			case jsb.EventAssetsManager.UPDATE_FAILED:
				cc.log("Update failed. " + event.getMessage());
				// Directly update previously failed assets, we suggest you to count and abort after several retry.
				var scene = cc.director.getRunningScene();
				scene.updateStatus("Update failed. ", 2);
				break;
			case jsb.EventAssetsManager.ERROR_UPDATING:
				cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
				break;
			case jsb.EventAssetsManager.ERROR_DECOMPRESS:
				cc.log("Decompress error: " + event.getMessage());
				break;
			default:
				break;
		}
	},

	retry: function () {
		if (this.manager) {
			this.manager.downloadFailedAssets();
		}
	},

	update: function () {
		if (this.isLoaded) {
			this.manager.update();
		}
	},

	cleanUp: function () {
		if (this.updateListener) {
			cc.eventManager.removeListener(this.updateListener);
			this.updateListener = null;
        }
        if (this.manager && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
			this.manager.release();
		}
		
		this.isLoaded = false;
	}
};