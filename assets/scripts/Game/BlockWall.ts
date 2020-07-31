const { ccclass } = cc._decorator;

@ccclass
export default class BlockWall extends cc.Component {
    init() {
        let children = this.node.children;
        for (let i = 0; i < children.length; i++) {
            children[i].active = false;
        }
    }

    tryDestory(box: cc.Rect) {
        let flag = false; // 是否与子弹发生碰撞

        let blacks = this.node.children;
        let position = this.node.position;

        for (let i = 0; i != blacks.length; i++) {
            // 将黑块坐标变换为相对于MapLayer的坐标
            let preBox = blacks[i].getBoundingBox();
            let tranBox = new cc.Rect(
                preBox.xMin + position.x,
                preBox.yMin + position.y,
                preBox.xMax - preBox.xMin,
                preBox.yMax - preBox.yMin
            );

            if (!blacks[i].active && tranBox.intersects(box)) {
                blacks[i].active = true;
                flag = true;
            }
        }

        if (this._isDestory()) {
            this.node.destroyAllChildren();
            this.node.destroy();
        }

        return flag;
    }

    _isDestory() {
        let blacks = this.node.children;

        for (let i = 0; i != blacks.length; i++) {
            if (!blacks[i].active) {
                return false;
            }
        }

        return true;
    }
}