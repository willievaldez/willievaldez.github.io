---
layout: post
title: My Time at Spliced
tags: [gamedev, industry, engineering]
---

In this post I'm going to go over the architecture that I am so proud to have helped build over
the past 4 years at Spliced. The team here is world class, and sadly, much of this code will never
see the light of day, so here I am to at least talk about how awesome it is.

## Does this mean what I think it means?
Short answer: yes.
My role, as well as many other folks at Spliced, is at risk for redundancy,
which is industry jargon that means "the studio is probably going kaput". Thankfully,
at the beginning of this year, I moved to Sweden, one of the leading countries in game dev,
and have a few leads on new jobs. Of course, it still sucks being in this position,
and I feel for all of my coworkers who were impacted by this whole implosion.
If you're hiring in game dev, please reach out to me, and I can connect you with some
really talented folks across the globe.

## The Goal of Spliced
From the get-go, the vision of our game was ambitious. We wanted to make a game that
offered "something for everyone". That vision manifested in the form of dozens of unique
gameplay experiences, such as classic arcade games, physics-simulated vehicle races,
immersive story driven cooperative modes, and a multitude of different competitive shooter modes.
And, very importantly, this game would be fully cross-platform, with a focus on mobile-first design.

Joining this team, I gave myself the task of gluing all of these experiences together into
something that felt seamless and cohesive for the player. That meant building a framework
that designers could utilize to implement virtually any type of gameplay, and seamlessly
transition between content without feeling like you're playing an entirely different game.

## The Design Framework
One of the most important things about designing a game as multi-faceted as this is creating systems
that would not require designers to re-invent the wheel for every new game mode. Every experience in our
game followed the same basic pattern: prestage, intro, gameplay, outro, and post-game. We defined the behavior of 
each of these phases via an "Experience Definition"; a concept that we borrowed (and heavily modified)
from Epic's own [Lyra starter project](https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-sample-game-in-unreal-engine). Due to the nature of our game, we made extensive use of
Game Feature Plugins, and neurotically divided our gameplay into various chunks, which were downloaded
on demand when a player requests to launch a given experience, all done with the goal of keeping the 
disk usage footprint small for our mobile users.

The Experience Definition would define all of the necessary game feature plugins, as well as "variations"
of gameplay (for example, each available map in a "team deathmatch" game mode acts as a "variation").
During packaging, we would bake a subset of Experience Definition data into a registry, which acted as an almanac of all of the
gameplay experiences available to a player, without needing to necessarly load or download the Experience Definition.

On top of all of this, we chunked our gameplay into "game contexts"; which, when activated, grant a player a set of
Gameplay Abilities, UI, and input configurations. This allowed designers to create and reuse these contexts anywhere
across our game.

## Angelscript Is King
If you aren't using [Angelscript](https://angelscript.hazelight.se/) for Unreal Engine, you haven't lived yet. This is the absolute best way
to make games in Unreal fast. I will probably make an entire blog post singing praise to this fork of UE. The only
significant modification we had to make was supporting Angelscript in Game Feature Plugins. This was no simple feat,
but once implemented, really unlocked our workflow.

## Hosts and Replication Modes
We had such a wide variety of gameplay, that we couldn't simply host all of our content on dedicated servers.
Every experience definition would define its "Host type", aka it's net mode: Standalone, Listen Server, or Dedicated.
Sandalone game modes would facilitate single player experiences such as the main menu, or the post game results screen.
Listen Server would facilitate social player-hosted experiences, such as our player housing mode. This was supported
by EOS sessions in the back-end, which allowed for cross-platform play without having to fiddle with things like
relay servers and IP anonymization. We used device id login in order to remove the need to create an EOS account at login.
Dedicated experiences are multiplayer experiences that cannot be feasibly hosted by a mobile device, or are competitive modes that
need to be more closely guarded against cheating.

In addition to these three basic net modes, we also had a fourth host type, "Instanced", which we'll get into below.

## Matchmaking
We really wanted the social aspect of our game to feel like you were living in a little corner of the internet.
As such, we created hub servers that facilitated matchmaking. These hubs hosted hundreds of players (utilizing
Epics new [Iris replication model](https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine)), and would be defined by certain
gameplay preferences, so that players with similar interests would play together, and bump into each other often.
The hubs were also networked and able to communicate between each other, so they could fill gaps in matchmaking when necessary.

When matchmaking, you would first connect to your hub server, and find/create an instance of a prestage lobby
corresponding to your matchmaking request. The hub server could host several of these instances in parallel, and
the replication for each instance was isolated, so we weren't replicating unnecessary information to players in
other instances. Hosting these prestages in our instanced servers allowed us to save on costs by minimizing the 
number of allocated servers with small player counts.

## The Server Fleet
Much of the heavy lifting in this domain is thanklessly done by [Agones](https://agones.dev/site/).
Agones allowed us to create several auto-scaling server pools. For development, this consisted of only two:
one for instanced servers, and one for "everything else".

We called the "everything else" pool "vanilla servers"; they existed in a vanilla "ready" state, waiting
for a prestage lobby to send an initialize request. This request would allocate and convert the vanilla server into
any gameplay experience, and, when fully initialized, notify the clients of the prestage lobby to connect.

Our plan was to define more pools based on performance profiles, and tag up the experience definitions with
these values. Is one experience particularly light and easy to run? Instantiate it from the low-perf pool.
Or maybe one of your instance is heavy on memory, but not CPU; we can define a pool for that as well. Having
generic pools like this removed the need to define discrete pools for each of our hundreds of combinations
of game modes and variations.

## With Our Powers Combined
The architecture that we built enabled insanely fast iteration. Anybody could create a new experience and be able to
play with friends in our packaged build within a single day. The engineering department would periodically host
internal game jams where we could make new experiences from scratch in the course of a week. The things we were able
to build in those weeks always blew me away. Times like those made me realize that we truly built something special.

It's a shame to see this journey coming to an end before we could ship our game, but I am so proud of the work
we've done, and made connections with some absolutely world class engineers that I hope to work with in the future.
We were given the task of making an architecture that could host *anything*, and I honestly believe we nailed it.
Thanks to everyone that I worked with at Spliced, it has truly been an honor working with you these past 4 years.
