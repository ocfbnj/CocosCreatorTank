import PlayerTank from "./PlayerTank";
import { Dir } from "./Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchControl extends cc.Component {
    @property([cc.Node])
    private buttons: cc.Node[] = [];
    @property(PlayerTank)
    private player: PlayerTank = null;

    protected onLoad() {
        // if (cc.sys.isMobile) {
        //     this.node.active = true;
        // } else {
        //     this.node.active = false;
        // }

        // 默认激活，调试用 TODO
        this.node.active = true;
    }

    protected onEnable() {
        this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
    }

    protected onDisable() {
        this.node.parent.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.parent.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        let globalPos = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.node.getBoundingBox().contains(globalPos)) {
            let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

            if (this.buttons[0].getBoundingBox().contains(pos)) {
                this.player.control(Dir.LEFT);
            } else if (this.buttons[1].getBoundingBox().contains(pos)) {
                this.player.control(Dir.UP);
            } else if (this.buttons[2].getBoundingBox().contains(pos)) {
                this.player.control(Dir.RIGHT);
            } else if (this.buttons[3].getBoundingBox().contains(pos)) {
                this.player.control(Dir.DOWN);
            }
        } else {
            this.player.shoot();
        }
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.buttons[0].getBoundingBox().contains(pos) ||
            this.buttons[1].getBoundingBox().contains(pos) ||
            this.buttons[2].getBoundingBox().contains(pos) ||
            this.buttons[3].getBoundingBox().contains(pos)) {

            this.player.controlStop();
        }
    }

}
