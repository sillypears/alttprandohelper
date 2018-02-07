(function(window) {
    var has = result;

    var always = function() { return 'available'; },
        can_enter = function(items, model) { return this.can_enter(items, model) ? 'available' : 'unavailable'; },
        can_enter_and = function(cond) {
            return function(items, model) { return this.can_enter(items, model) && cond.call(this, items, model) ? 'available' : 'unavailable'; };
        },
        can_enter_and_then = function(cond, then) {
            return function(items, model) {
                return this.can_enter(items, model) && cond.call(this, items, model) ?
                    then.call(this, items, model) :
                    'unavailable';
            };
        },
        can_enter_state = function(items, model) { return this.can_enter_state(items, model); },
        can_enter_state_if = function(cond) {
            return function(items, model) { return cond.call(this, items, model) ? this.can_enter_state(items, model) : 'unavailable'; };
        },
        has_keys = function() { return this.keys; },
        has_big_key = function() { return this.big_key; },
        available_or_dark = function(items) { return items.lantern ? 'available' : 'dark'; };

    function update_keysanity_dungeons(dungeons) {
        return update(dungeons, {
            eastern: { $merge: {
                chest_limit: 6,
                key_limit: 0,
                // Todo: verify
                can_complete: function(items) {
                    return this.big_key ? dungeons.eastern.can_complete.call(this, items) : 'unavailable';
                },
                can_progress: function(items) {
                    if (this.big_key && items.has_bow() && items.lantern) return 'available';
                    if (this.chests > 3) return 'possible';
                    if (this.chests > 2) return this.big_key || items.lantern ? 'possible' : 'dark';
                    if (this.chests > 1 && this.big_key) return items.lantern ? 'possible' : 'dark';
                    return this.big_key && items.has_bow() && !items.lantern ? 'dark' : 'unavailable';
                },
                // ---
                locations: {
                    compass: {
                        caption: 'Compass Chest',
                        can_reach: always
                    },
                    cannonball: {
                        caption: 'Bowling Room',
                        can_reach: always
                    },
                    map: {
                        caption: 'Map Chest',
                        can_reach: always
                    },
                    big_chest: {
                        caption: 'Big Chest',
                        can_reach: function() {
                            return this.big_key ? 'available' : 'unavailable';
                        }
                    },
                    big_key: {
                        caption: 'Big Key Chest',
                        can_reach: available_or_dark
                    },
                    boss: {
                        caption: 'Armos Knights',
                        second_map: true,
                        can_reach: function(items) {
                            return this.big_key && items.has_bow() ?
                                available_or_dark(items) :
                                'unavailable';
                        }
                    }
                }
            } },

            desert: { $merge: {
                chest_limit: 6,
                key_limit: 1,
                /*can_enter: function(items) { return items.book || items.flute && items.glove === 2 && items.mirror; },*/
                // Todo: verify
                can_complete: function(items) {
                    if (!this.big_key) return 'unavailable';
                    // Todo: why no boots check?
                    var state = dungeons.desert.can_complete.call(this, items);
                    return state === 'possible' ? 'available' : state;
                },
                can_progress: function(items) {
                    if (!this.can_enter(items)) return 'unavailable';
                    if (this.big_key && this.keys && items.glove && (items.lantern || items.firerod) && items.boots) return 'available';
                    if (this.chests === 6) return 'possible';
                    if (this.chests > 4 && (this.big_key || items.boots)) return 'possible';
                    if (this.chests > 3 && (this.keys || (this.big_key && items.boots))) return 'possible';
                    if (this.chests > 3 && this.big_key && (items.lantern || items.firerod)) return 'possible';
                    if (this.chests > 2 && this.keys && (this.big_key || items.boots)) return 'possible';
                    if (this.chests > 2 && this.big_key && items.boots && (items.lantern || items.firerod)) return 'possible';
                    if (this.chests > 1 && this.big_key && this.keys && ((items.glove && items.lantern) || items.boots)) return 'possible';
                    return 'unavailable';
                },
                // ---
                doors: {
                    north: { caption: 'North', can_reach: always },
                    south: { caption: 'South', second_map: true, can_reach: always }
                },
                locations: function() {
                    var reach_east_wing = function(items) {
                        return this.doors.south.opened || !this.doors.north.opened && items.glove || this.keys;
                    };

                    return {
                        map: {
                            caption: 'Map Chest',
                            second_map: true,
                            can_reach: can_enter
                        },
                        big_chest: {
                            caption: 'Big Chest',
                            second_map: true,
                            can_reach: can_enter_and(has_big_key)
                        },
                        torch: {
                            caption: 'Item on Torch',
                            second_map: true,
                            can_reach: can_enter_and(has('boots'))
                        },
                        big_key: {
                            caption: 'Big Key Chest',
                            second_map: true,
                            can_reach: can_enter_and(reach_east_wing)
                        },
                        compass: {
                            caption: 'Compass Chest',
                            second_map: true,
                            can_reach: can_enter_and(reach_east_wing)
                        },
                        boss: {
                            caption: 'Lanmolas',
                            can_reach: can_enter_and(function(items) {
                                return (items.has_melee_bow() || items.has_cane() || items.has_rod()) &&
                                    items.glove && (this.doors.north.opened || !this.doors.south.opened || this.keys) &&
                                    items.has_fire() && this.big_key;
                            })
                        }
                    };
                }()
            } },

            hera: { $merge: {
                chest_limit: 6,
                key_limit: 1,
                /*can_enter: function(items) { return (items.mirror || items.hookshot && items.hammer) && (items.glove || items.flute); },*/
                // Todo: verify
                can_enter_state: function(items) {
                    return this.can_enter(items) ?
                        items.flute || items.lantern ? 'available' : 'dark' :
                        'unavailable';
                },
                can_complete: function(items) {
                    return this.big_key && items.has_melee() && this.can_enter(items) ?
                        items.flute || items.lantern ? 'available' : 'dark' :
                        'unavailable';
                },
                can_progress: function(items) {
                    if (!this.can_enter(items)) return 'unavailable';
                    if (this.big_key && this.keys === 1 && items.has_melee() && items.has_fire())
                        return items.flute || items.lantern ? 'available' : 'dark';
                    if (this.chests >= 5) return items.flute || items.lantern ? 'possible' : 'dark';
                    if (this.chests >= 4 && this.keys === 1 && items.has_fire())
                        return items.flute || items.lantern ? 'possible' : 'dark';
                    if (this.chests >= 3 && this.big_key) return items.flute || items.lantern ? 'possible' : 'dark';
                    if (this.chests >= 2 && this.big_key && (items.has_melee() || this.keys === 1 && items.has_fire()))
                        return items.flute || items.lantern ? 'possible' : 'dark';
                    return 'unavailable';
                },
                // ---
                locations: {
                    cage: {
                        caption: 'Basement Cage',
                        second_map: true,
                        can_reach: can_enter_state
                    },
                    map: {
                        caption: 'Map Chest',
                        second_map: true,
                        can_reach: can_enter_state
                    },
                    compass: {
                        caption: 'Compass Chest',
                        can_reach: can_enter_state_if(has_big_key)
                    },
                    big_chest: {
                        caption: 'Big Chest',
                        can_reach: can_enter_state_if(has_big_key)
                    },
                    big_key: {
                        caption: 'Big Key Chest',
                        second_map: true,
                        can_reach: can_enter_state_if(function(items) { return this.keys && items.has_fire(); })
                    },
                    boss: {
                        caption: 'Moldorm',
                        can_reach: can_enter_state_if(function(items) { return this.big_key && items.has_melee(); })
                    }
                }
            } },

            darkness: { $merge: {
                chest_limit: 14,
                key_limit: 6,
                /*can_enter: function(items, model) {
                    return items.moonpearl && (model.agahnim() || items.glove && items.hammer || items.glove === 2 && items.flippers)
                },*/
                // Todo: verify
                can_complete: function(items, model) {
                    return this.can_enter(items, model) && items.has_bow() && items.hammer &&
                        this.big_key && this.keys ?
                            items.lantern ?
                                this.keys > 5 ? 'available' : 'possible' :
                                'dark' :
                        'unavailable';
                },
                can_progress: function(items, model) {
                    // Todo: verify
                    if (!this.can_enter(items, model)) return 'unavailable';
                    if (this.keys === 6 && this.big_key && items.hammer && items.has_bow() && items.lantern) return 'available';

                    var _this = this,
                        count = { keys: this.keys, reachable: 0, dark: 0 },
                        keys = function(keys) { return keys > 0 },
                        calculate = function(c, x) {
                            var match = (x.cond ? cast_array(x.cond) : [])
                                .reduce(function(t, f) { return t && f.call(_this, c.keys); }, true);
                            return update(c, match ? { $addition: { keys: x.keys || 0, reachable: x.reachable, dark: x.dark || 0 } } : {});
                        };
                    count = [
                        { reachable: 1 }, // left side
                        { cond: function() { return items.has_bow() }, reachable: 2 }, // bow locked right side
                        // bridge and dropdown, with/without front door opened
                        { cond: function() { return items.has_bow() && items.hammer; }, reachable: 2 },
                        { cond: [function() { return !(items.has_bow() && items.hammer); }, keys], keys: -1, reachable: 2 },
                        // back of POD, since it yields most chests for one key
                        { cond: keys, keys: -1, reachable: 3, dark: 2 },
                        // Dark maze
                        { cond: keys, keys: -1, reachable: this.big_key ? 3 : 2, dark: this.big_key ? 3 : 2 },
                        // helmasaur. we do not prioritize him when he is beatable. This way we show the max amount of items.
                        { cond: [keys, function() { return this.big_key & items.has_bow() && items.hammer; }], keys: -1, reachable: 1, dark: 1 },
                        { cond: keys, keys: -1, reachable: 1 }, // spike Room
                        { cond: keys, keys: -1, reachable: 1 } // big key chest
                    ].reduce(calculate, count);

                    return this.chests > 14 - count.reachable ?
                        items.lantern || this.chests > 14 - (count.reachable - count.dark) ? 'possible' : 'dark' :
                        'unavailable';
                },
                // ---
                doors: {
                    front: { caption: 'Front', can_reach: always },
                    arena: { caption: 'Arena', can_reach: always },
                    big_key: { caption: 'Big Key', can_reach: always },
                    maze: { caption: 'Dark Maze', can_reach: always },
                    hellway: { caption: 'Hellway', can_reach: always },
                    boss: { caption: 'Boss', can_reach: always }
                },

                keys_left: function() {
                    return this.keys - sum(map_values(this.doors, property('opened')));
                },

                // Hammery bomb jump
                hammery_jump: false,

                locations: function() {
                    var reach_arena = function(items) { return this.doors.front.opened || this.keys_left() || items.has_bow() && items.hammer; },
                        hammery_or_dark = function(items) { return this.hammery_jump || items.lantern ? 'available' : 'dark'; };

                    return {
                        shooter: {
                            caption: 'Shooter Room',
                            second_map: true,
                            can_reach: can_enter
                        },
                        arena_ledge: {
                            caption: 'Statler & Waldorf',
                            can_reach: can_enter_and(result('has_bow'))
                        },
                        map: {
                            caption: 'Map Chest',
                            can_reach: can_enter_and(result('has_bow'))
                        },
                        arena_bridge: {
                            caption: 'Arena Bridge',
                            can_reach: can_enter_and(reach_arena)
                        },
                        stalfos: {
                            caption: 'Southern Cross',
                            second_map: true,
                            can_reach: can_enter_and(reach_arena)
                        },
                        big_key: {
                            caption: 'Big Key Chest',
                            second_map: true,
                            can_reach: can_enter_and(function(items) { return 2
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.big_key.opened
                                <= this.keys_left();
                            })
                        },
                        compass: {
                            caption: 'Compass Chest (Terrorpin Station)',
                            can_reach: can_enter_and(function(items) { return 2
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                <= this.keys_left();
                            })
                        },
                        basement_left: {
                            caption: 'Treasury - Left Chest',
                            can_reach: can_enter_and_then(function(items) { return 2
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                <= this.keys_left();
                            }, available_or_dark)
                        },
                        basement_right: {
                            caption: 'Treasury - Right Chest',
                            can_reach: can_enter_and_then(function(items) { return 2
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                <= this.keys_left();
                            }, available_or_dark)
                        },
                        big_chest: {
                            caption: 'Big Chest',
                            can_reach: can_enter_and_then(function(items) {
                                return this.big_key && 3
                                    - (this.doors.front.opened || items.has_bow() && items.hammer)
                                    - this.doors.arena.opened
                                    - (this.doors.maze.opened || this.hammery_jump)
                                    <= this.keys_left();
                            }, hammery_or_dark)
                        },
                        hellway: {
                            caption: 'Harmless Hellway',
                            can_reach: can_enter_and(function(items) { return 3
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                - this.doors.hellway.opened
                                <= this.keys_left();
                            })
                        },
                        maze_top: {
                            caption: 'Dark Maze - Top Chest',
                            can_reach: can_enter_and_then(function(items) { return 3
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                - (this.doors.maze.opened || this.hammery_jump)
                                <= this.keys_left();
                            }, available_or_dark)
                        },
                        maze_bottom: {
                            caption: 'Dark Maze - Bottom Chest',
                            can_reach: can_enter_and_then(function(items) { return 3
                                - (this.doors.front.opened || items.has_bow() && items.hammer)
                                - this.doors.arena.opened
                                - (this.doors.maze.opened || this.hammery_jump)
                                <= this.keys_left();
                            }, available_or_dark)
                        },
                        boss: {
                            caption: 'Helmasaur King',
                            can_reach: can_enter_and_then(function(items) {
                                return items.has_bow() && items.hammer && (this.doors.boss.opened || this.keys_left()) && this.big_key;
                            }, available_or_dark)
                        }
                    };
                }()
            } },

            swamp: { $merge: {
                chest_limit: 10,
                key_limit: 1,
                /*can_enter: function(items, model) {
                    return items.moonpearl && items.mirror && items.flippers && (items.can_reach_outcast(model.agahnim()) || model.agahnim() && items.hammer);
                },*/
                // Todo: verify
                can_complete: function(items, model) {
                    return this.can_enter(items, model) && items.hammer && items.hookshot && this.keys ? 'available' : 'unavailable';
                },
                can_progress: function(items, model) {
                    if (!this.can_enter(items, model)) return 'unavailable';
                    if (this.big_key && this.keys === 1 && items.hammer && items.hookshot) return 'available';
                    if (this.chests === 10) return 'possible';
                    if (this.chests >= 9 && this.keys === 1) return 'possible';
                    if (this.chests >= 6 && this.keys === 1 && items.hammer) return 'possible';
                    if (this.chests >= 5 && this.keys === 1 && items.hammer && this.big_key) return 'possible';
                    if (this.chests >= 2 && this.keys === 1 && items.hammer && items.hookshot) return 'possible';
                    return 'unavailable';
                },
                // ---
                locations: function() {
                    var has_keys_hammer = function(items) { return this.keys && items.hammer; },
                        has_keys_hammer_big_key = function(items) { return this.keys && items.hammer && this.big_key; },
                        has_keys_hammer_hookshot = function(items) { return this.keys && items.hammer && items.hookshot; };

                    return {
                        entrance: {
                            caption: 'Entrance',
                            second_map: true,
                            can_reach: can_enter
                        },
                        map: {
                            caption: 'Map Chest',
                            second_map: true,
                            can_reach: can_enter_and(has_keys)
                        },
                        big_key: {
                            caption: 'Big Key Chest',
                            second_map: true,
                            can_reach: can_enter_and(has_keys_hammer)
                        },
                        west: {
                            caption: 'West Wing',
                            second_map: true,
                            can_reach: can_enter_and(has_keys_hammer)
                        },
                        compass: {
                            caption: 'Compass Chest',
                            second_map: true,
                            can_reach: can_enter_and(has_keys_hammer)
                        },
                        big_chest: {
                            caption: 'Big Chest',
                            second_map: true,
                            can_reach: can_enter_and(has_keys_hammer_big_key)
                        },
                        toilet_left: {
                            caption: 'Toilet - Left Chest',
                            can_reach: can_enter_and(has_keys_hammer_hookshot)
                        },
                        toilet_right: {
                            caption: 'Toilet - Right Chest',
                            can_reach: can_enter_and(has_keys_hammer_hookshot)
                        },
                        waterfall: {
                            caption: 'Waterfall Room',
                            can_reach: can_enter_and(has_keys_hammer_hookshot)
                        },
                        boss: {
                            caption: 'Arrghus',
                            can_reach: can_enter_and(has_keys_hammer_hookshot)
                        }
                    };
                }()
            } },

            skull: { $merge: {
                chest_limit: 8,
                key_limit: 3,
                /*can_enter: function(items, model) {
                    return items.can_reach_outcast(model.agahnim());
                },*/
                // Todo: verify
                can_complete: dungeons.skull.can_complete,
                can_progress: function(items, model) {
                    if (!this.can_enter(items, model)) return 'unavailable';
                    if (this.big_key && items.sword > 0 && items.firerod) return 'available';
                    if (this.chests >= 4) return 'possible';
                    if (this.chests >= 3 && (this.big_key || items.firerod)) return 'possible';
                    if (this.chests >= 2 && (this.big_key || items.sword > 0) && items.firerod) return 'possible';
                    return 'unavailable';
                },
                // ---
                locations: {
                    big_key: {
                        caption: 'Big Key Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    compass: {
                        caption: 'Compass Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    map: {
                        caption: 'Map Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    pot_prison: {
                        caption: 'Pot Prison',
                        second_map: true,
                        can_reach: can_enter
                    },
                    big_chest: {
                        caption: 'Big Chest',
                        second_map: true,
                        can_reach: can_enter_and(has_big_key)
                    },
                    bridge: {
                        caption: 'Bridge Room',
                        can_reach: can_enter_and(function(items) { return items.firerod; })
                    },
                    boss: {
                        caption: 'Mothula',
                        can_reach: can_enter_and(function(items) { return items.firerod && items.sword; })
                    }
                }
            } },

            thieves: { $merge: {
                chest_limit: 8,
                key_limit: 1,
                /*can_enter: function(items, model) {
                    return items.can_reach_outcast(model.agahnim());
                },*/
                // Todo: verify
                can_complete: function(items) {
                    return this.big_key ?
                        dungeons.thieves.can_complete.call(this, items) :
                        'unavailable';
                },
                can_progress: function(items, model) {
                    if (!this.can_enter(items, model)) return 'unavailable';
                    if (this.big_key && this.keys === 1 && items.hammer) return 'available';
                    if (this.chests >= 5) return 'possible';
                    if (this.chests >= 3 && this.big_key) return 'possible';
                    if (this.chests >= 2 && this.big_key && (items.has_melee() || items.has_cane())) return 'possible';
                    return 'unavailable';
                },
                // ---
                locations: {
                    big_key: {
                        caption: 'Big Key Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    map: {
                        caption: 'Map Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    compass: {
                        caption: 'Compass Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    ambush: {
                        caption: 'Ambush Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    attic: {
                        caption: 'Attic',
                        second_map: true,
                        can_reach: can_enter_and(has_big_key)
                    },
                    cell: {
                        caption: "Blind's Cell",
                        can_reach: can_enter_and(has_big_key)
                    },
                    big_chest: {
                        caption: 'Big Chest',
                        can_reach: can_enter_and(function(items) { return this.big_key && this.keys && items.hammer; })
                    },
                    boss: {
                        caption: 'Blind',
                        can_reach: can_enter_and(function(items) { return this.big_key && (items.has_melee() || items.has_cane()); })
                    }
                }
            } },

            ice: { $merge: {
                chest_limit: 8,
                key_limit: 2,
                /*can_enter: function(items) {
                    return items.moonpearl && items.flippers && items.glove === 2 && (items.firerod || items.sword && items.bombos);
                },*/
                // Todo: verify
                can_complete: function(items) {
                    return this.can_enter(items) ?
                        this.big_key && (this.keys > 1 || this.keys && items.somaria) ? 'available' : 'possible' :
                        'unavailable';
                },
                can_progress: function(items) {
                    // Logic to match Standard/Open to list possible if wanting to do bomb jump,
                    // does allow logic to leave and re-enter dungeon after picking up dungeon small keys
                    if (!this.can_enter(items)) return 'unavailable';
                    if (this.big_key && items.hammer) return this.keys > 1 || this.keys && items.somaria ? 'available' : 'possible';
                    if (this.chests > 4) return 'possible';
                    if (this.chests > 3 && this.big_key) return 'possible';
                    if (this.chests > 1 && items.hammer) return 'possible';
                    return 'unavailable';
                },
                // ---

                // firebar bomb jump
                bomb_jump: false,

                locations: {
                    compass: {
                        caption: 'Compass Chest',
                        second_map: true,
                        can_reach: can_enter
                    },
                    spike: {
                        caption: 'Spike Room',
                        can_reach: can_enter
                    },
                    freezor: {
                        caption: 'Freezor Room',
                        can_reach: can_enter
                    },
                    iced_t: {
                        caption: 'Iced T Room',
                        can_reach: can_enter
                    },
                    big_chest: {
                        caption: 'Big Chest',
                        can_reach: can_enter_and(has_big_key)
                    },
                    big_key: {
                        caption: 'Big Key Chest',
                        second_map: true,
                        can_reach: can_enter_and(has('hammer'))
                    },
                    map: {
                        caption: 'Map Chest',
                        second_map: true,
                        can_reach: can_enter_and(has('hammer'))
                    },
                    boss: {
                        caption: 'Kholdstare',
                        second_map: true,
                        can_reach: can_enter_and(function(items) {
                            return (this.bomb_jump ||
                                this.big_key && (this.keys && items.somaria || this.keys === 2 && items.hookshot)) &&
                                items.hammer;
                        })
                    }
                }
            } },

            mire: { $merge: {
                chest_limit: 8,
                key_limit: 3,
                /*can_enter: function(items) {
                    return items.moonpearl && items.flute && items.glove === 2 && (items.boots || items.hookshot);
                },*/
                // Todo: verify
                can_complete: function(items) {
                    return this.can_enter(items) && items.somaria && this.big_key ?
                        items.medallion_check(this.medallion) || (items.lantern ? 'available' : 'dark') :
                        'unavailable';

                },
                can_progress: function(items) {
                    var state = this.can_enter(items) ? items.medallion_check(this.medallion) : 'unavailable';
                    if (state) return state;

                    if (items.lantern && this.big_key && items.somaria) return 'available';
                    if (this.chests >= 5) return 'possible';
                    if (this.chests >= 3 && (this.big_key || items.firerod || items.lantern)) return 'possible';
                    if (this.chests >= 3 && this.big_key && items.somaria && !items.firerod && !items.lantern) return 'dark';
                    if (this.chests >= 2 && this.big_key && items.firerod) return 'possible';
                    if (this.chests >= 1 && this.big_key && items.somaria && items.firerod && !items.lantern) return 'dark';
                    return 'unavailable';
                },
                // ---
                locations: function() {
                    var can_enter_with_medallion = function(items) {
                            return this.can_enter(items) ? items.medallion_check(this.medallion) : 'unavailable';
                        },
                        can_enter_with_medallion_and = function(cond) {
                            return function(items) {
                                return this.can_enter(items) && cond.call(this, items) ? items.medallion_check(this.medallion) : 'unavailable';
                            };
                        };

                    return {
                        main: {
                            caption: 'Main Lobby',
                            can_reach: can_enter_with_medallion
                        },
                        compass: {
                            caption: 'Compass Chest',
                            can_reach: can_enter_with_medallion
                        },
                        bridge: {
                            caption: 'Docaty Bridge',
                            can_reach: can_enter_with_medallion
                        },
                        map: {
                            caption: 'Map Chest',
                            can_reach: can_enter_with_medallion
                        },
                        spike: {
                            caption: 'Spike Chest',
                            can_reach: can_enter_with_medallion
                        },
                        big_chest: {
                            caption: 'Big Chest',
                            can_reach: can_enter_with_medallion_and(has_big_key)
                        },
                        big_key: {
                            caption: 'Big Key Chest',
                            can_reach: can_enter_with_medallion_and(result('has_fire'))
                        },
                        boss: {
                            caption: 'Vitreous',
                            second_map: true,
                            // Todo: May return DARK without the medallion. Fix later.
                            can_reach: can_enter_and_then(
                                function(items) { return this.big_key && items.somaria; },
                                function(items) { return items.lantern ? items.medallion_check(this.medallion) : 'dark'; })
                        }
                    };
                }()
            } },

            turtle: { $merge: {
                chest_limit: 12,
                key_limit: 4,
                /*can_enter: function(items) {
                    return items.moonpearl && items.hammer && items.glove === 2 && items.somaria && (items.hookshot || items.mirror);
                },*/
                // Todo: verify
                can_enter_state: function(items) {
                    return this.can_enter(items) ?
                        items.medallion_check(this.medallion) || (items.flute || items.lantern ? 'available' : 'dark') :
                        'unavailable';
                },
                can_complete: function(items) {
                    this.can_enter(items) && items.icerod && items.firerod && this.big_key && this.keys > 2 ?
                        items.medallion_check(this.medallion) || (items.lantern ?
                            this.keys === 3 ? 'possible' : 'available' :
                            'dark') :
                        'unavailable';
                },
                can_progress: function(items) {
                    // Todo: verify
                    var state = this.can_enter(items) ? items.medallion_check(this.medallion) : 'unavailable';
                    if (state) return state;

                    var laser_safety = items.byrna || items.cape || items.shield === 3,
                        dark_room = items.lantern ? 'possible' : 'dark';
                    if (this.big_key && this.keys === 4 && items.firerod && items.icerod && items.lantern && laser_safety) return 'available';
                    if (this.chests > 11) return 'possible';
                    if (this.chests > 9 && (items.firerod || this.keys > 1)) return 'possible';
                    if (this.chests > 8 && (this.big_key && this.keys > 1 || this.keys && items.firerod)) return 'possible';
                    if (this.chests > 7 && this.keys > 1 && items.firerod) return 'possible';
                    if (this.chests > 6 && this.big_key && this.keys > 1 && items.firerod) return 'possible';
                    if (this.chests > 4 && this.big_key && this.keys > 1 && laser_safety) return dark_room;
                    if (this.chests > 3 && this.big_key && this.keys > 2 && laser_safety) return dark_room;
                    if (this.chests > 2 && this.big_key && this.keys > 1 && items.firerod && laser_safety) return dark_room;
                    if (this.chests > 2 && this.big_key && this.keys === 4 && items.firerod && items.icerod) return dark_room;
                    if (this.chests > 1 && this.big_key && this.keys > 2 && items.firerod && laser_safety) return dark_room;
                    return 'unavailable';
                },
                // ---

                doors: { pipe: { caption: 'Pipe', can_reach: always } },

                locations: function() {
                    var has_big_key_access = function() { return this.keys > 1 && this.big_key },
                        medallion_or_dark = function(items) { return items.medallion_check(this.medallion) || (items.lantern ? 'available' : 'dark'); };

                    var laser_bridge = can_enter_and_then(function(items) {
                        return (items.cape || items.byrna || items.shield === 3) && this.keys - this.doors.pipe.opened > 2 && this.big_key;
                    }, medallion_or_dark);

                    return {
                        big_key: {
                            caption: 'Big Key Chest',
                            // Todo: I'll figure this out later...
                            can_reach: function(items) { return 'possible'; }
                        },
                        compass: {
                            caption: 'Compass Chest',
                            can_reach: can_enter_state
                        },
                        chain_chomps: {
                            caption: 'Chain Chomps',
                            can_reach: can_enter_state_if(has_keys)
                        },
                        roller_left: {
                            caption: 'Roller Room - Left Chest',
                            can_reach: can_enter_state_if(has('firerod'))
                        },
                        roller_right: {
                            caption: 'Roller Room - Right Chest',
                            can_reach: can_enter_state_if(has('firerod'))
                        },
                        big_chest: {
                            caption: 'Big Chest',
                            can_reach: can_enter_state_if(has_big_key_access)
                        },
                        crystaroller: {
                            caption: 'Crystaroller Room',
                            can_reach: can_enter_state_if(has_big_key_access)
                        },
                        eye_bl: {
                            caption: 'Laser Bridge - Bottom Left Chest',
                            can_reach: laser_bridge
                        },
                        eye_br: {
                            caption: 'Laser Bridge - Bottom Right Chest',
                            can_reach: laser_bridge
                        },
                        eye_tl: {
                            caption: 'Laser Bridge - Top Left Chest',
                            can_reach: laser_bridge
                        },
                        eye_tr: {
                            caption: 'Laser Bridge - Top Right Chest',
                            can_reach: laser_bridge
                        },
                        boss: {
                            caption: 'Trinexx',
                            second_map: true,
                            can_reach: can_enter_and_then(function(items) {
                                return this.keys - this.doors.pipe.opened > 3 && this.big_key && items.firerod && items.icerod;
                            }, medallion_or_dark)
                        }
                    };
                }()
            } }
        });
    }

    function update_keysanity_encounters(encounters) {
        return update(encounters, {
            agahnim: { $merge: {
                can_complete: function(items, model) {
                    return model.regions.castle_tower.keys === 2 ?
                        encounters.agahnim.can_complete.call(this, items) :
                        'unavailable';
                }
            } }
        });
    }

    var keysanity_regions = {
        escape: { key_limit: 1 },
        castle_tower: { key_limit: 2 },
        ganon_tower: { key_limit: 4, chest_limit: 27 }
    };

    // Todo: verify
    function update_keysanity_chests(chests) {
        return update(chests, {
            mimic: { $merge: {
                is_available: function(items, model) {
                    return items.moonpearl && items.hammer && items.glove === 2 && items.somaria && items.mirror ?
                        items.medallion_check(model.dungeons.turtle.medallion) ||
                            (model.dungeons.turtle.keys > 1 ? 'available' : 'unavailable') :
                        'unavailable';
                }
            } },
            escape_side: { $merge: {
                is_available: function(items, model) {
                    return items.glove || model.regions.escape.keys ?
                        items.glove || items.lantern ? 'available' : 'dark' :
                        'unavailable';
                }
            } },
            $merge: {
                castle_foyer: {
                    caption: 'Castle Tower Foyer',
                    is_available: function(items) {
                        return items.sword >= 2 || items.cape ? 'available' : 'unavailable';
                    }
                },
                castle_maze: {
                    caption: 'Castle Tower Dark Maze',
                    is_available: function(items, model) {
                        return model.regions.castle_tower.keys && (items.sword >= 2 || items.cape) ?
                            items.lantern ? 'available' : 'dark' :
                            'unavailable';
                    }
                }
            }
        });
    }

    window.keysanity = function(location, build) {
        return {
            dungeons: build_keysanity_dungeons(build.dungeons(update_keysanity_dungeons(location.dungeons))),
            encounters: build.encounters(update_keysanity_encounters(location.encounters)),
            regions: build_regions(keysanity_regions),
            chests: build.chests(update_keysanity_chests(location.chests))
        };
    };

    function build_keysanity_dungeons(dungeons) {
        return map_values(dungeons, function(dungeon) {
            return update(dungeon, {
                $merge: { keys: 0, big_key: false },
                doors: function(doors) {
                    return doors && map_values(doors, function(door) {
                        return create(door, { opened: false });
                    });
                },
                locations: function(locations) {
                    return map_values(locations, function(location) {
                        return create(location, { marked: false });
                    });
                }
            });
        });
    }

    function build_regions(regions) {
        return update(map_values(regions, function(region) { return create(region); }), {
            escape: { $merge: { keys: 0 } },
            castle_tower: { $merge: { keys: 0 } },
            ganon_tower: {
                $merge: { keys: 0, big_key: false },
                $apply: function(x) { return update(x, { $merge: { chests: x.chest_limit } }); }
            }
        });
    }
}(window));
