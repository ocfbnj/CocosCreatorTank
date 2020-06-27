import UpdateInformations from "./UpdateInformations";
import TouchControl from "./TouchControl";
import MapLayer from "./MapLayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Integer)
    public level: number = 1;

    @property({ type: cc.AudioClip })
    private binAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private shootAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private playerMoveAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private tankBombAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private campBombAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private gameOverAudio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    private gameStartAudio: cc.AudioClip = null;

    @property(cc.Prefab)
    private black: cc.Prefab = null;

    @property(cc.Node)
    private stageArea: cc.Node = null;

    @property(cc.Boolean)
    private enableAudio: boolean = true;

    private playerMoveID: number;

    protected onLoad() {
        this.init();
    }

    public init() {
        // 播放开始游戏音效
        this.playAudio("game_start");

        // 禁用子节点
        for (const node of this.node.children) {
            if (node.name == "Main Camera") {
                // 设置填充色为灰色
                node.getComponent(cc.Camera).backgroundColor = new cc.Color(100, 100, 100);
            } else {
                node.active = false;
            }
        }

        this.showAnimation();
    }

    /**
     * 转场动画
     * */
    private showAnimation() {
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
            .to(0.5, { position: cc.v3(0, visableSize.height / 4) })
            .call(() => {
                blackUp.destroy();
            })
            .start();

        cc.tween(blackDown)
            .to(0.5, { position: cc.v3(0, -visableSize.height / 4) })
            .call(() => {
                blackDown.destroy();

                // 展示stage
                this.showStage();
            })
            .delay(1)
            .start();
    }

    private showStage() {
        // 激活Stage
        this.stageArea.active = true;
        this.stageArea.getChildByName("level").getComponent(cc.Label).string = this.level.toString();

        // 一秒后切换到游戏界面
        this.scheduleOnce(() => {
            // 关闭Stage
            this.stageArea.active = false;

            // 开启Informations
            let informations = this.node.getChildByName("Informations").getComponent(UpdateInformations);
            informations.node.active = true;
            informations.updateCurrentLevel(this.level);

            // 加载地图
            let mapLayer = this.node.getChildByName("MapLayer").getComponent(MapLayer);
            cc.log(mapLayer);
            mapLayer.node.active = true;

            // 触摸区域
            let touchControl = this.node.getChildByName("TouchControl").getComponent(TouchControl);
            if (cc.sys.isMobile) {
                touchControl.node.active = true;
            } else {
                touchControl.node.active = false;
            }
        }, 1);
    }

    public playAudio(name: string, loop = false) {
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

    public stopAudio(name: string) {
        if (!this.enableAudio) return;

        if (name == "player_move") {
            cc.audioEngine.stop(this.playerMoveID);
        }
    }

    public gameOverUp() {
        let visableSize = cc.view.getVisibleSize();
        let gameOverNode = cc.find("/Canvas/gameover_up");
        gameOverNode.active = true;
        gameOverNode.setPosition(0, -visableSize.height / 2 - gameOverNode.height / 2);

        cc.tween(gameOverNode)
            .to(1.5, { position: cc.v3(0, 0) })
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

                let bigGameOVer = this.node.getChildByName("big_gameover");
                bigGameOVer.active = true;
                bigGameOVer.setPosition(0, 0);

                // 2秒后回到主界面 TODO
                this.scheduleOnce(() => {

                });
            })
            .start();
    }
}
