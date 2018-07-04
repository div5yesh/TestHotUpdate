var Animation = {
	start: function (obj) {
		console.log("Animating...");
		var anim = cc.RotateBy.create(5.0, 360);
		
		const callBackFn = new cc.CallFunc(() => { }, this, ""),
			seq = cc.Sequence.create(anim, callBackFn);
		
		obj.runAction(seq);
	}
}