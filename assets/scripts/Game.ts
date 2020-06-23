const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property({ type: cc.AudioClip })
    binAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    shootAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    playerMoveAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    tankBombAudio: cc.AudioClip = null;

    @property(cc.Prefab)
    black: cc.Prefab = null;

    @property(cc.Integer)
    level: number = 1;

    @property(cc.Label)
    stageLabel: cc.Label = null;

    enableAudio: boolean;
    playerMoveID: number;

    onLoad() {
        this.enableAudio = false;

        this.showAnimation();

        if (cc.sys.isMobile) {
            this.node.getChildByName("TouchControl").active = true;
        }
    }

    showAnimation() {
        let visableSize = cc.view.getVisibleSize();

        // 展示动画
        let blackUp = cc.instantiate(this.black);
        blackUp.width = visableSize.width;
        blackUp.setPosition(0, visableSize.height / 2 + blackUp.height / 2);

        let blackDown = cc.instantiate(this.black);
        blackDown.width = visableSize.width;
        blackDown.setPosition(0, -(visableSize.height / 2 + blackDown.height / 2));

        this.node.addChild(blackUp);
        this.node.addChild(blackDown);

        cc.tween(blackUp)
            .to(0.5, { position: cc.v2(0, visableSize.height / 4) })
            .call(() => {
                blackUp.destroy();
                // this.node.getChildByName("MapLayer").active = true;
            })
            .start();

        cc.tween(blackDown)
            .to(0.5, { position: cc.v2(0, -visableSize.height / 4) })
            .call(() => {
                blackDown.destroy();

                // 显示stage
                this.showStage();

            })
            .delay(1)
            .start();
    }

    showStage() {
        this.stageLabel.node.active = true;
        this.stageLabel.string = `Stage ${this.level}`;

        this.scheduleOnce(() => {
            this.stageLabel.node.destroy();

            // 开启图层
            this.node.getChildByName("MapLayer").active = true;
        }, 1);
    }

    playAudio(name: string, loop = false) {
        if (!this.enableAudio) return;

        if (name == "bin") {
            cc.audioEngine.playEffect(this.binAudio, loop);
        } else if (name == "shoot") {
            cc.audioEngine.playEffect(this.shootAudio, loop);
        } else if (name == "player_move") {
            this.playerMoveID = cc.audioEngine.playEffect(this.playerMoveAudio, loop);
            cc.audioEngine.setVolume(this.playerMoveID, 0.8);
        } else if (name == "tank_bomb") {
            cc.audioEngine.playEffect(this.tankBombAudio, loop);
        }
    }

    stopAudio(name: string) {
        if (!this.enableAudio) return;

        if (name == "player_move") {
            cc.audioEngine.stop(this.playerMoveID);
        }
    }
}
