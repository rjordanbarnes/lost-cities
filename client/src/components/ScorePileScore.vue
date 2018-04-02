<template>
    <div class="score-pile-score">
        {{ score }}
    </div>
</template>

<script>
    export default {
        props: ['cards'],
        data() {
            return {
                error: null
            }
        },
        computed: {
            score() {
                if (this.cards.length > 0) {
                    let runningTotal = -20;
                    let investments = 0;

                    for (let i = 0; i < this.cards.length; i++) {
                        if (this.cards[i].CardValue !== 1)
                            runningTotal += this.cards[i].CardValue;
                        else
                            investments++;
                    }

                    if (investments !== 0)
                        runningTotal *= (investments + 1);

                    if (this.cards.length >= 8)
                        runningTotal += 20;

                    return runningTotal;
                } else {
                    return 0;
                }
            }
        }
    }
</script>

<style scoped>
    .score-pile-score {
        height: 50px;
        border-style: solid;
        border-width: 2px;
    }
</style>
