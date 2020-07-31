const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioMng extends cc.Component {
    @property({ type: cc.AudioClip })
    binAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    shootAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    playerMoveAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    tankBombAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    campBombAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    gameOverAudio: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    gameStartAudio: cc.AudioClip = null;
    @property(cc.Boolean)
    enableAudio: boolean = true;
    
    playerMoveID: number;

    playAudio(name: string, loop = false) {
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

    stopAudio(name: string) {
        if (!this.enableAudio) return;

        if (name == "player_move") {
            cc.audioEngine.stop(this.playerMoveID);
        }
    }
}
