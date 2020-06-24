const { ccclass, property } = cc._decorator;

@ccclass
export default class Prop extends cc.Component {
    @property([cc.SpriteFrame])
    frames: cc.SpriteFrame[] = [];

    init() {
        // 随机变成一种道具
        
        // 随机放在一个地点

        // 闪烁动画

        // 检查玩家是否拾取

        // 20秒后消失
    }

    // 检查玩家是否拾取
    check() {

    }

    // 产生效果
    effective() {

    }
}
