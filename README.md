## GroovTap

### Created by Matt Lee

#### [Video Walkthrough](https://www.youtube.com/watch?v=IvmLaul27W4)

#### Summary

GroovTap is a browser-based call and response rhythm game made with React. It was originally called "Rhythmic" but this was changed after learning the domain name is not available.

#### How to Run

Go to [groovtap.com](https://www.groovtap.com/) on a desktop computer and press "Play." The game does not work on mobile because mobile browsers really do not like working with audio.

#### How to Play

The game is split between two main states: call(computer generated rhythms) and response(user inputs), which the game goes back and forth between at consistent intervals lasting four beats.

**Call State**

- Indicated by a gray background
- In this state the computer will play a rhythm for you. The screen flashes blue along with the rhythmic hit

**Response State**

- Indicated by a black background
- In this state the user presses any key on the keyboard (not the mouse or trackpad) to repeat the exact same rhythm that the computer played during the previous call state.
- If the tap was good, a solid tap sound will play and the screen flashes green
- If the tap was bad, a "splatty" sound play and the screen flashes red

#### Keeping Score

- In the top left corner, the number of good taps is displayed in green
- In the top right corner the number of red taps is displayed in red
- At the end of the game the score is calculated as
  goodTaps - (badTaps / 2) = score
- In this particular song, the highest possible score is 54 because there are 54 total computer generated taps to repeat.
- There are 4 distinct score categories:
  - Flanders (score <= 30)
  - Ringo (score >= 31 && score <= 40)
  - Zigaboo (score >= 41 && score <= 50)
  - Animal (score >= 51)
- Since "Animal" is the highest score category, achieving this can be considered winning the game.

#### The Future of GroovTap

- GroovTap was built so that more songs can be easily added by adding new audio files and csv files containing timestamps of the hits. So the game will be expanded far beyond this 30-second trial.
- New users, especially non-musicians, have a lot of trouble figuring out the game's rules, so a tutorial song featuring instructions and very easy rhythms needs to be made.
- The ability to adjust difficulty will be added, which will adjust the buffer for what is considered a goodTap
- Due to the game's simplicity and "tappiness", as well as audio complications with mobile browsers, the ideal platform is a mobile device. These new features will be implemented in a React Native app. This has the added benefit of reduced latency due to the content being stored locally on the user's device.

#### Repositories

- Game code: https://github.com/mattleesounds/rhythmic
- Scripts to convert rhythms into timestamps: https://github.com/mattleesounds/rhythmicscripts
