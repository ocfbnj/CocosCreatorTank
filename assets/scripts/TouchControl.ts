import PlayerTank from "./PlayerTank";
import { Dir } from "./Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchControl extends cc.Component {
    @property([cc.Node])
    buttons: cc.Node[] = [];

    @property(PlayerTank)
    player: PlayerTank = null;

    onLoad() {
        // 设置位置
        let size = cc.view.getVisibleSize();

        this.node.x = size.width * 0.05 + this.node.width * 0.5 - size.width * 0.5;
        this.node.y = size.height * 0.1 + this.node.height * 0.5 - size.height * 0.5;

        this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);

        for (const button of this.buttons) {
            cc.log(button.position);
        }
    }

    onTouchStart(event: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.buttons[0].getBoundingBox().contains(pos)) {
            this.player.control(Dir.LEFT);
        } else if (this.buttons[1].getBoundingBox().contains(pos)) {
            this.player.control(Dir.UP);
        } else if (this.buttons[2].getBoundingBox().contains(pos)) {
            this.player.control(Dir.RIGHT);
        } else if (this.buttons[3].getBoundingBox().contains(pos)) {
            this.player.control(Dir.DOWN);
        } else {
            this.player.shoot();
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.buttons[0].getBoundingBox().contains(pos) ||
            this.buttons[1].getBoundingBox().contains(pos) ||
            this.buttons[2].getBoundingBox().contains(pos) ||
            this.buttons[3].getBoundingBox().contains(pos)) {

            this.player.controlStop();
        }
    }

}
