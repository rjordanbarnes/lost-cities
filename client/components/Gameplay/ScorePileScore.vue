<template>
    <div class="container p-0">
        <div id="investment-container" class="col-12 d-flex flex-row p-0">
            <div class="investment" v-if="numberOfInvestments >= 3">$</div>
            <div class="investment" v-if="numberOfInvestments >= 2">$</div>
            <div class="investment" v-if="numberOfInvestments >= 1">$</div>
        </div>
        <div class="score-pile-score col-12">
            {{ score }}
        </div>
    </div>
</template>

<script>
    export default {
        name: "ScorePileScore",
        props: ['cards'],
        data() {
            return {
                error: null
            }
        },
        computed: {
            // Calculates score based on received cards prop.
            score() {
                if (this.cards.length > 0) {
                    // Starts at -20 points
                    let runningTotal = -20;

                    for (let i = 0; i < this.cards.length; i++) {
                        if (this.cards[i].CardValue !== 1)
                            runningTotal += this.cards[i].CardValue;
                    }

                    // Investments multiplier
                    runningTotal *= (this.numberOfInvestments + 1);

                    // Bonus points for lots of cards.
                    if (this.cards.length >= 8)
                        runningTotal += 20;

                    return runningTotal;
                } else {
                    return 0;
                }
            },
            numberOfInvestments() {
                let investments = 0;

                for (let i = 0; i < this.cards.length; i++) {
                    if (this.cards[i].CardValue === 1)
                        investments++;
                }

                return investments;
            }
        }
    }
</script>

<style scoped>
    #investment-container {
        height: 24px
    }

    .score-pile-score {
        font-weight: bold;
        font-size: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .investment {
        background-color: mediumpurple;
        flex-basis: 33%;
        height: 100%;
        text-align: center;
    }
</style>
