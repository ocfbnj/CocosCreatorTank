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
    }
}