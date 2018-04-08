<template>
    <div id="scoreboard" class="d-flex flex-column justify-content-between">
        <div>
            <div class="game-member-info">
                {{ opponent.username }} ({{ opponent.skillRating }})
            </div>
            <div class="total-score">
                {{ opponentScore }}
            </div>
        </div>
        <div>
            <div class="turn-info">
                <div v-if="opponent.isTurn">
                    <div><i class="fa fa-chevron-up fa-3x"></i></div>
                </div>
            </div>

            <div>
                <div class="turn-state-info">{{ gameDetails.turnState }}</div>
            </div>

            <div class="turn-info">
                <div v-if="player.isTurn">
                    <div><i class="fa fa-chevron-down fa-3x"></i></div>
                </div>
            </div>
        </div>
        <div>
            <div class="game-member-info">
                {{ player.username }} ({{ player.skillRating }})
            </div>
            <div class="total-score">
                {{ playerScore }}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['gameDetails', 'player', 'opponent'],
        data() {
            return {}
        },
        computed: {
            // Calculates score based on received cards prop.
            opponentScore() {
                return this.calculateTotalScore(this.opponent.scorePiles);
            },
            playerScore() {
                return this.calculateTotalScore(this.player.scorePiles);
            }
        },
        methods: {
            calculateTotalScore(scorePiles) {
                console.log(scorePiles);
                let totalScore = 0;

                for (const scorepile in scorePiles) {
                    const scorepileObject = scorePiles[scorepile];

                    const cards = scorepileObject[Object.keys(scorepileObject)[0]];

                    if (cards.length > 0) {
                        // Starts at -20 points
                        let runningTotal = -20;
                        let numberOfInvestments = 0;

                        for (let i = 0; i < cards.length; i++) {
                            if (cards[i].CardValue !== 1)
                                runningTotal += cards[i].CardValue;
                            else
                                numberOfInvestments++;
                        }

                        // Investments multiplier
                        if (numberOfInvestments !== 0)
                            runningTotal *= (numberOfInvestments + 1);

                        // Bonus points for lots of cards.
                        if (cards.length >= 8)
                            runningTotal += 20;

                        totalScore += runningTotal;
                    }
                }

                return totalScore;
            }
        }
    }
</script>

<style scoped>
    #scoreboard {
        align-items: center;
        justify-content: center;
        border-style: solid;
        border-width: 1px;
        padding: 15px;
    }

    .turn-info {
        height: 80px;
        display: flex;
        align-items: center;
    }

    .game-member-info {
        font-weight: bold;
        font-size: 20px;
    }

    .turn-state-info {
        font-size: 20px;
    }

    .total-score {
        font-size: 40px;
        font-weight: bold;
    }

    div {
        width: 100%;
        text-align: center;
    }
</style>
