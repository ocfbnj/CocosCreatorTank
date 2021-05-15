import UpdateInformations from "./UpdateInformations";
import MapLayer from "./MapLayer";
import AudioMng from "../AudioMng";
import { GameMode } from "../Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property(cc.Prefab)
    black: cc.Prefab = null;
    @property
    _level: number = 1;

    _gameMode: GameMode = GameMode.ONE;

    @property({
        type: cc.Integer,
        min: 1,
        max: 35
    })
    get level(): number {
        return this._level;
    }

    set level(v: number) {
        if (v > 35) v -= 35;
        this._level = v;
    }

    gameStart() {
        // 播放开始游戏音效
        cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("game_start");

        // 隐藏GameLayer和Stage
        cc.find("/Canvas/GameLayer").active = false;
        cc.find("/Canvas/StageArea").active = false;

        // 设置相机背景色
        cc.find("/Canvas/Main Camera").getComponent(cc.Camera).backgroundColor
            = new cc.Color(100, 100, 100);

        // 展示开场动画
        this.showAnimation();
    }

    gameOver() {
        let visableSize = cc.view.getVisibleSize();

        let gameOverNode = cc.find("/Canvas/External/gameover_up");
        gameOverNode.setPosition(0, -visableSize.height / 2 - gameOverNode.height / 2);

        cc.tween(gameOverNode)
            .to(1.5, { position: cc.v3(0, 0) })
            .delay(0.5)
            .call(() => {
                // 播放失败音效
                cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("game_over");

                // 禁用其他节点
                cc.find("/Canvas/GameLayer").active = false;
                cc.find("/Canvas/External/gameover_left").active = false;
                cc.find("/Canvas/External/gameover_up").active = false;

                // 切换到Game Over
                cc.find("/Canvas/Main Camera").getComponent(cc.Camera).backgroundColor
                    = new cc.Color(0, 0, 0);
                let bigGameOVer = cc.find("/Canvas/External/big_gameover");
                bigGameOVer.setPosition(0, 0);

                // TODO 2秒后回到主界面
                // cc.director.preloadScene("Menu");
                // this.scheduleOnce(() => {
                //     cc.director.loadScene("Menu");
                // }, 2);
            })
            .start();
    }

    onLoad() {
        this.gameStart();
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

        let canvas = cc.find("/Canvas");

        blackUp.parent = canvas;
        blackDown.parent = canvas;

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

    showStage() {
        let stageArea = cc.find("/Canvas/StageArea");

        // 激活Stage
        stageArea.active = true;
        stageArea.getChildByName("level").getComponent(cc.Label).string = this._level.toString();

        // 一秒后切换到游戏界面
        this.scheduleOnce(() => {
            // 关闭Stage
            stageArea.active = false;

            // 开启GameLayer
            let gameLayer = cc.find("/Canvas/GameLayer");
            let informations = gameLayer.getChildByName("Informations").getComponent(UpdateInformations);
            let mapLayer = gameLayer.getChildByName("MapLayer").getComponent(MapLayer);

            gameLayer.active = true;

            // 初始化信息区域
            informations.init(this._level);

            // 初始化地图
            mapLayer.init();
        }, 1);
    }
}
