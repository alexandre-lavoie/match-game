# Engine Overview

Match Game follows a [Model-View-Controller architecture (MVC)](https://developer.mozilla.org/en-US/docs/Glossary/MVC). Models are often considered data classes, Views as renderers, and controllers all under controllers. In addition to MVC, the engine uses an [Event-Driven architecture](https://aws.amazon.com/event-driven-architecture/) to fully decouple the models from the views.

## AI

AI is a turn-based logic that can determine which moves to take. The path finding AI should offer a working solution for most games. Modifications could be made for more simple or complex AI.

## Board

A board is a 2D NxN grid of tiles. It uses the `board` sprite key. It contains utility methods to interact with tiles, from moving them to seeing if they match.

### Tile

Tiles are the objects displayed on the board. It uses an index in the `tiles` spritesheet. They all have the same size and are automatically handled by the board.

### Coordinates

There are two types of coordinates for boards: _World_ and _Grid_. World coordinates are x, y coordinates in the scene/world. Grid coordinates are x, y indices into the NxN grid.

## Controller

Controllers are a bridge between users and their entity representation. They also get information about the game state, in case that is required.

### Pointer

The pointer controller is the default human controller to use with a mouse/finger.

### AI

The ai controller is a bridge layer between AI logic and the game. This allows the AI to interact like if it were a player. The actualy logic is separate into an AI section.

## Entities

Entities are a collection of player related data.

### Line

Lines are the current state of the line match performed by the players.

### Value

Values can be any numerical value. The are accessed by their key value.

## Match

Matches are rules of how to combine tiles together. This could be 3 in a row, all different types, etc. Many matches can be defined for one game. The priority of the matches can also be defined.

## Probability Map

Probability maps are a way to define how frequent each item are. This is defined as a ratio. For example, 1 X, 2 Y, 3 Z -> this will make a probability of X 1/5, Y 2/5, Z 3/5.

## Game

Games are the core game logic. It handles player turns, board updating, scene change, etc. It should be accessible from any object in a scene, directly or indirectly (for example, ai -> entity -> game). This can be viewed as a [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).

## Scene

Scenes are simply Phaser scenes. This said, the scene should only be considered as an initializer for assets, models, views, and controllers. Everything related to the game logic should be stored in the game class. Views should also never be modified through the scene, they should listen to events emittied by their model counterpart.
