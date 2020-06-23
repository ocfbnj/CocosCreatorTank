import UpdateInformations from "./UpdateInformations";
import TouchControl from "./TouchControl";

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

    @property({ type: cc.AudioClip })
    campBombAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    gameOverAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    gameStartAudio: cc.AudioClip = null;

    @property(cc.Prefab)
    black: cc.Prefab = null;

    @property(cc.Integer)
    level: number = 1;

    @property(cc.Node)
    stageArea: cc.Node = null;

    enableAudio: boolean;
    playerMoveID: number;

    onLoad() {
        this.enableAudio = true;

        this.init();
    }

    init() {
        // 播放开始游戏音效
        this.playAudio("game_start");

        for (const node of this.node.children) {
            if (node.name == "Main Camera") {
                node.getComponent(cc.Camera).backgroundColor = new cc.Color(100, 100, 100);
            } else {
                node.active = false;
            }
        }

        this.showAnimation();
    }

    // 转场动画
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
        this.stageArea.active = true;
        this.stageArea.getChildByName("level").getComponent(cc.Label).string = this.level.toString();

        this.scheduleOnce(() => {
            this.stageArea.active = false;

            // 开启图层
            let informations = this.node.getChildByName("Informations").getComponent(UpdateInformations);
            informations.node.active = true;
            informations.init();
            informations.updateCurrentLevel(this.level);

            // 加载地图
            let mapLayer = this.node.getChildByName("MapLayer").getComponent("MapLayer");
            mapLayer.node.active = true;
            mapLayer.init();

            // 触摸区域
            let touchControl = this.node.getChildByName("TouchControl").getComponent(TouchControl);
            if (cc.sys.isMobile) {
                touchControl.node.active = true;
                touchControl.init();
            } else {
                touchControl.node.active = false;
            }
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
        } else if (name == "game_over") {
            cc.audioEngine.playEffect(this.gameOverAudio, loop);
        } else if (name == "game_start") {
            cc.audioEngine.playEffect(this.gameStartAudio, loop);
        } else if (name == "camp_bomb") {
            cc.audioEngine.playEffect(this.campBombAudio, loop);
        }
    }

    stopAudio(name: string) {
        if (!this.enableAudio) return;

        if (name == "player_move") {
            cc.audioEngine.stop(this.playerMoveID);
        }
    }

    gameOverUp() {
        let visableSize = cc.view.getVisibleSize();
        let gameOverNode = cc.find("/Game/gameover_up");
        gameOverNode.active = true;
        gameOverNode.setPosition(0, -visableSize.height / 2 - gameOverNode.height / 2);

        cc.tween(gameOverNode)
            .to(1.5, { position: cc.v2(0, 0) })
            .delay(0.5)
            .call(() => {
                // 切换到Game Over
                // 关闭所有节点
                for (const node of this.node.children) {
                    if (node.name == "Main Camera")
                        // 设置背景色为黑色
                        this.node.getChildByName("Main Camera").getComponent(cc.Camera).backgroundColor = new cc.Color(0, 0, 0);
                    else
                        node.active = false;
                }

                // 播放失败音效
                this.playAudio("game_over");
                this.node.getChildByName("big-gameover").active = true;

                // 2秒后回到主界面 TODO
                this.scheduleOnce(() => {

                });
            })
            .start();
    }
}
