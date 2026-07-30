## Melissa
Melissa is a minimal scripting language and runtime for creating interactive stories and text adventures.

**Currently featuring:**
- variables
- conditions (if/else)
- labels
- text display
- choices
- scene loading

### Fast to write • Easy to read
Melissa uses its own scripting language designed to be fast to write and easy to understand.

**Example**:
```melissa
text "You've entered the Gloomy Castle's guard tower."
say "Knight" "Greetings, traveller."
label "knight_pay"
say "Knight" "To go further you must pay 50 coins."
choice:
	"Give money":
    	if ($money >= 50):
        	say "Knight" "You can go in."
            set $money ($money - 50)
            load "castle.mel"
        else:
        	say "Knight" "You don't have enough money."
            goto "knight_pay"
    "Leave":
    	text "You've left the tower."
```
### Project architecture
Melissa projects are described using a single `project.json` file. 

**Example**:
```json
{
    "name": "Dark travel",
    "version": "0.0.1",
    "output": "console",
    "start": "scenes/start.mel"
}
```
Each `.mel` file represents one scene.

### Roadmap
**v0.1**  _current_

- [x] Scripting language 
- [x] Scene loading
- [x] Simple console output
- [x] Project loader

**v0.2**  _planned_
- [ ] Functions
- [ ] Loops & `if-elif-else` conditions
- [ ] Extensions & plugins
- [ ] Asset manager
- [ ] Custom outputs
- [ ] Checkpoint system

### License

Licensed under GNU AGPLv3.



**The project is still under construction. Feedback, issues and contributions are always welcome.**
