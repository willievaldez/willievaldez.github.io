---
layout: post
title: Class Registration During Static Init
subtitle: Tricking C++ to do your bidding
tags: [C++, oop]
---

Have you ever wanted to identify a class simply by supplying a string?
You and me both, buddy. I was working on a personal game project and I wanted
to define a level by feeding the program a CSV file containing the spatial layout.
I identify different types of enemy spawners in the CSV file with human readable names.
Each name correlates to an explicit AI class derived from a base class `Enemy`.


## The Wrong Way(s) To Do It
When loading the CSV, we can cache the spawn type in the spawner as a member variable `std::string m_enemyType`.
 Inside of `Spawner::Spawn()`, we can implement this god awful monstrosity:
```cpp
std::shared_ptr<Enemy> Spawner::Spawn()
{
    if (m_enemyType == "Goomba")
    {
        return std::make_shared<Goomba>();
    }

    // ... lots of else ifs here
    
    else if (m_enemyType == "Koopa")
    {
        return std::make_shared<Koopa>();
    }
}
```
*note: the string definition could just as easily be converted to an enum to avoid the computationally expensive string compare*

How about we try to make it a little smarter? `Enemy` can keep a static map of strings to contructors.

```cpp
 static std::unordered_map<std::string, std::shared_ptr<Enemy>(*)()> s_enemyTypeMap;
```

This immensely simplifies (and optimizes) our `Spawner::Spawn()` function:
```cpp
std::shared_ptr<Enemy> Spawner::Spawn()
{
    std::shared_ptr<Enemy> spawnedEnemy;

    auto& foundEnemy = Enemy::s_enemyTypeMap.find(m_enemyType);
    if (foundEnemy != Enemy::s_enemyTypeMap.end())
    {
        spawnedEnemy = foundEnemy->second();
    }

    return spawnedEnemy;
}
```

*BUT* we have to populate that map somehow, right? This usually leads to a big ugly function definition in a cpp file that looks like this:
```cpp
#include <Goomba.h>
// ... lots of includes here
#include <Koopa.h>

// define a function who's signature matches "std::shared_ptr<Enemy>(*)()"
template<typename T>
std::shared_ptr<Enemy> EnemyFactory()
{
    return std::make_shared<T>();
}

/*static*/ void Enemy::RegisterEnemyTypes()
{
    s_enemyTypeMap["Goomba"] = &EnemyFactory<Goomba>;

    // ... lots of map insertions here
    s_enemyTypeMap["Koopa"] = &EnemyFactory<Koopa>;

}
```
This implementation sucks because:
* Whenever we make a new `Enemy` class, we can't forget to add an entry in to `RegisterEnemyTypes`
* Modifying any derived `Enemy` header file forces us to recompile this source file every time

## The Better Way To Do It
Wouldn't it be cool if each derived Enemy class could register itself to `s_enemyTypeMap`? We can add a static function to `Enemy` that adds an entry to its EnemyType map.
```cpp
template<typename T>
static void RegisterEnemyType(const char* typeName)
{
    auto foundType = s_enemyTypeMap.find(typeName);
    s_enemyTypeMap[typeName] = &EnemyFactory<T>;
}
```

Now how do we get each class to call `RegisterEnemyType`? If only we could call a function in the static space of a source file. Well, we can! We just have make  `RegisterEnemyType()` return a value. Let's make a macro that constructs a static value with our function call like this:
```cpp
#define REGISTER_ENEMY_TYPE(CLASS) size_t g_enemyNum##__COUNTER__ = Enemy::RegisterEnemyType<CLASS>(#CLASS)
```
We append `__COUNTER__` to the variable name to prevent the compiler from collapsing our static variables.

Now, inside of an enemy source file, say, `Goomba.cpp`, we can add
```cpp
REGISTER_ENEMY_TYPE(Goomba);
```
and viola, we have a self registering type system! Right? Well almost. We can't gurantee which static variables are intialized first, and it is possible that we call `RegisterEnemyType()` before initializing `s_enemyTypeMap`, so we can write an accessor and guarantee that `s_enemyTypeMap` is initialized before it gets accessed.

Here's the final version of `Enemy.h`:
```cpp
#pragma once

#include <unordered_map>
#include <memory>
#include <string>

class Enemy;
template<typename T>
std::shared_ptr<Enemy> EnemyFactory()
{
    return std::make_shared<T>();
}

class Enemy
{
public:
    Enemy() = default;
    virtual ~Enemy() = default;

    using EnemyTypeMap = std::unordered_map<std::string, std::shared_ptr<Enemy>(*)()>;

    template<typename T>
    static size_t RegisterEnemyType(const char* typeName)
    {
        EnemyTypeMap& enemyTypes = AccessEnemyTypes();
        auto foundType = enemyTypes.find(typeName);
        assert(foundType == enemyTypes.end());
        enemyTypes[typeName] = &EnemyFactory<T>;
        return enemyTypes.size();
    };

    static std::shared_ptr<Enemy> CreateEnemy(const char* typeName)
    {
        std::shared_ptr<Enemy> returnedEnemy = nullptr;
        EnemyTypeMap& enemyTypes = AccessEnemyTypes();
        auto foundType = enemyTypes.find(typeName);
        if (foundType != enemyTypes.end())
        {
            returnedEnemy = foundType->second();
        }
        return returnedEnemy;
    };

private:
    static EnemyTypeMap& AccessEnemyTypes()
    {
        static EnemyTypeMap s_enemyTypeMap;
        return s_enemyTypeMap;
    };
};

#define REGISTER_ENEMY_TYPE(CLASS) size_t g_enemyNum##__COUNTER__ = Enemy::RegisterEnemyType<CLASS>(#CLASS);

```

Pretty slick usage pattern at the expense of a little boilerplate. Not a bad trade off, if you ask me.