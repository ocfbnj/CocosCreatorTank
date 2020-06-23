import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockCamp extends cc.Component {
    @property(cc.SpriteFrame)
    destoryed: cc.SpriteFrame = null;

    onLoad() {
        this.node.name = "block_camp";
        this.node.parent.getComponent("MapLayer").blocks.push(this.node);
    }

    tryDestory() {
        this.getComponent(cc.Sprite).spriteFrame = this.destoryed;

        let game = cc.find("/Game").getComponent(Game);
        // 播放爆炸音效
        game.playAudio("camp_bomb");

        // 摧毁后播放上升的game over动画
        game.gameOverUp();
    }
}