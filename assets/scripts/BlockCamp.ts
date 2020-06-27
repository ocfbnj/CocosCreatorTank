import Game from "./Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockCamp extends cc.Component {
    @property(cc.SpriteFrame)
    private destoryed: cc.SpriteFrame = null;

    public tryDestory() {
        this.getComponent(cc.Sprite).spriteFrame = this.destoryed;

        let game = cc.find("/Canvas").getComponent(Game);
        // 播放爆炸音效
        game.playAudio("camp_bomb");

        // 摧毁后播放上升的game over动画
        game.gameOverUp();
    }
}