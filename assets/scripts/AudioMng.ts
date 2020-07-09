const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioMng extends cc.Component {
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
    @property(cc.Boolean)
    private enableAudio: boolean = true;
    private playerMoveID: number;

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
}
