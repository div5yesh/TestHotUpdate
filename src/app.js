var HelloWorldLayer = cc.Layer.extend({
	sprite: null,
	ctor: function () {
		//////////////////////////////
		// 1. super init first
		this._super();

		/////////////////////////////
		// 2. add a menu item with "X" image, which is clicked to quit the program
		//    you may modify it.
		// ask the window size
		var size = cc.winSize;

		/////////////////////////////
		// 3. add your codes below...
		// add a label shows "Hello World"
		// create and initialize a label
		var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
		// position the label on the center of the screen
		helloLabel.x = size.width / 2;
		helloLabel.y = size.height / 2 + 200;
		// add the label as a child to this layer
		this.addChild(helloLabel, 5);

		this.logsLabel = new cc.LabelTTF("Update Logs", "Arial", 18);
		this.logsLabel.setAnchorPoint(0, 1);
		this.logsLabel.x = 0;
		this.logsLabel.y = size.height;

		this.addChild(this.logsLabel, 5);

		this.retrybtn = new ccui.Button();
		this.retrybtn.setTitleText("Retry");
		this.retrybtn.setTitleFontSize(21);
		this.retrybtn.setAnchorPoint(1, 1);
		this.retrybtn.x = size.width;
		this.retrybtn.y = size.height - 50;
		this.addChild(this.retrybtn, 5);

		this.updatebtn = new ccui.Button();
		this.updatebtn.setTitleText("Update");
		this.updatebtn.setTitleFontSize(21);
		this.updatebtn.setAnchorPoint(1, 1);
		this.updatebtn.x = size.width;
		this.updatebtn.y = size.height - 50;
		this.addChild(this.updatebtn, 5);

		var onRetryButtonClicked = function(sender, type){
			switch (type) {
				case ccui.Widget.TOUCH_BEGAN:
					break;
				case ccui.Widget.TOUCH_MOVED:
					break;
				case ccui.Widget.TOUCH_ENDED:
					HotUpdateManager.retry();
					break;
			}
		};

		var onUpdateButtonClicked = function(sender, type){
			switch (type) {
				case ccui.Widget.TOUCH_BEGAN:
					break;
				case ccui.Widget.TOUCH_MOVED:
					break;
				case ccui.Widget.TOUCH_ENDED:
					cc.game.restart();
					break;
			}
		};

		this.updatebtn.addTouchEventListener(onUpdateButtonClicked, this);
		this.retrybtn.addTouchEventListener(onRetryButtonClicked, this);

		// add "HelloWorld" splash screen"
		this.sprite = new cc.Sprite(res.HelloWorld_png);
		this.sprite.attr({
			x: size.width / 2,
			y: size.height / 2
		});
		this.addChild(this.sprite, 0);

		return true;
	},

	updateStatus: function (str, done) {
		this.logsLabel.setString("\n" + str + "\n" + this.logsLabel.getString());
		if (done === 1) {
			this.retrybtn.setVisible(false);
			this.updatebtn.setVisible(true);
		} else if (done === 2) {
			this.updatebtn.setVisible(false);
			this.retrybtn.setVisible(true);
		} else {
			this.retrybtn.setVisible(false);
			this.updatebtn.setVisible(false);
		}
	}
});

var HelloWorldScene = cc.Scene.extend({
	onEnter: function () {
		this._super();
		this.layer = new HelloWorldLayer();
		this.addChild(this.layer);

		setTimeout(function () {
			HotUpdate();
		}, 0);
	},

	updateStatus: function (str, done) {
		this.layer.updateStatus(str, done);
	}
});