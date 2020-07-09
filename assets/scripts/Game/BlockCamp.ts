import Game from "./Game";
import AudioMng from "../AudioMng";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockCamp extends cc.Component {
    @property(cc.SpriteFrame)
    private destoryed: cc.SpriteFrame = null;

    public tryDestory() {
        this.getComponent(cc.Sprite).spriteFrame = this.destoryed;

        // 播放爆炸音效
        cc.find("/Game/AudioMng").getComponent(AudioMng).playAudio("camp_bomb");

        // 摧毁后播放上升的game over动画
        cc.find("/Game").getComponent(Game).gameOver();
    }
}