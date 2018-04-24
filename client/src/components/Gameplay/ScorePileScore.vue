<template>
    <div class="container">
    <div class="row">
        <div class="score-pile-score col-9">
            {{ score }}
        </div>
        <div class="investment-count col-3 flex-column p-0">
            <div class="investment" v-bind:class="{'investment-active': numberOfInvestments >= 3}"></div>
            <div class="investment" v-bind:class="{'investment-active': numberOfInvestments >= 2}"></div>
            <div class="investment" v-bind:class="{'investment-active': numberOfInvestments >= 1}"></div>
        </div>
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
    .score-pile-score {
        border-style: solid;
        border-width: 2px;
        font-weight: bold;
        font-size: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .investment-count {
        border-style: solid;
        border-width: 2px;
    }

    .investment {
        border-style: solid;
        border-width: 1px;
        background-color: white;
        height: 33.33%;
    }

    .investment-active {
        background-color: mediumpurple;
    }
</style>
