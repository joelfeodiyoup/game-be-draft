import { Button } from "@/components/ui/button/Button";
import { Section } from "@/components/ui/section/Section";
import { Stack } from "@/components/ui/stack/Stack";
import { useGameDetail } from "./useGameDetail";
import { useGameRating } from "./useGameRating";

export const GameDetail = () => {
    const { scenariosQuery, game, createScenarioMutation, startGameSessionMutation} = useGameDetail();
    const gameRating = useGameRating({ game });

    if (!game) return <div>no game selected</div>
    if (scenariosQuery.isLoading) return <div>Loading...</div>
    return <div>
        <Stack>
        <Section title="name">
            {game.title}
        </Section>
        <Section title={"description"}>
            <p>{game.description}</p>
        </Section>
        <Section title={"rating"}>
            <p>current rating: {Number(game.average_rating)} from {game.rating_count} reviews</p>
        </Section>
        <Section title="Rate game">
            <Stack>

            <div>
                {[1,2,3,4,5].map(r => <Button key={r} onClick={() => gameRating.setState(state => ({...state, rating: r}))}>{r}</Button>)}
            </div>
            <textarea onChange={event => gameRating.setState(state => ({...state, comment: event.target.value}))} />
            <Button onClick={() => gameRating.mutation.mutate()}>submit</Button>
            </Stack>
        </Section>
        <Section title="reviews">
            {game.game_ratings?.map(review => (
                <section>
                    <p>{review.comment}</p>
                    <p>
                    <span>{review.rating} / 5</span>
                    <span> - </span>
                    <strong>{ review.player.username}</strong>
                    </p>
                    </section>
            ))}
        </Section>
        <Section title={"create new scenario"}>
            <Button onClick={() => createScenarioMutation.mutate()}>create (admin only)</Button>
        </Section>
        <Section title="scenario list">
            <ul>
                {!scenariosQuery.data || scenariosQuery.data.length === 0 && <div>no scenarios</div>}
            {scenariosQuery.data?.map(scenario => (
                <li key={scenario.id}>{scenario.title}<Button onClick={() => startGameSessionMutation.mutate({scenario})}>start</Button></li>
            ))}
            </ul>
        </Section>
        </Stack>
    </div>
}