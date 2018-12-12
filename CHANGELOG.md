# Change Log

## [1.4.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/1.4.0) (2018-12-12)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/1.3.0...1.4.0)

**Implemented enhancements:**

- Update limit monitoring with checks for lowering repeat notifications [\#92](https://github.com/NASA-AMMOS/AIT-GUI/issues/92)

**Closed issues:**

- Add example OpenMCT bridge code [\#88](https://github.com/NASA-AMMOS/AIT-GUI/issues/88)
- Add option to bliss-field so field name is rendered [\#61](https://github.com/NASA-AMMOS/AIT-GUI/issues/61)

**Merged pull requests:**

- Issue \#61 - Adding tool tip to fieldname [\#97](https://github.com/NASA-AMMOS/AIT-GUI/pull/97) ([aywaldron](https://github.com/aywaldron))
- Issue \#92: Update monitoring with notification throttling [\#93](https://github.com/NASA-AMMOS/AIT-GUI/pull/93) ([jordanpadams](https://github.com/jordanpadams))
- Issue \#88 - Add support for integration with OpenMCT [\#89](https://github.com/NASA-AMMOS/AIT-GUI/pull/89) ([MJJoyce](https://github.com/MJJoyce))

## [1.3.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/1.3.0) (2018-11-09)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/1.2.0...1.3.0)

**Fixed bugs:**

- Update limit monitoring to handle EVR monitoring [\#90](https://github.com/NASA-AMMOS/AIT-GUI/issues/90)

**Closed issues:**

- Clock format toggling doesn't rotate through options as expected [\#94](https://github.com/NASA-AMMOS/AIT-GUI/issues/94)
- Bad ait-plot-config JSON object crashes the GUI [\#72](https://github.com/NASA-AMMOS/AIT-GUI/issues/72)

**Merged pull requests:**

- Issue \#72 - Adding try/catch for errors in parsing plot config element [\#96](https://github.com/NASA-AMMOS/AIT-GUI/pull/96) ([aywaldron](https://github.com/aywaldron))
- Issue \#94 - Clock format toggling doesn't rotate through options as expected [\#95](https://github.com/NASA-AMMOS/AIT-GUI/pull/95) ([aywaldron](https://github.com/aywaldron))
- Issue \#90: EVR handling for limit monitoring [\#91](https://github.com/NASA-AMMOS/AIT-GUI/pull/91) ([jordanpadams](https://github.com/jordanpadams))

## [1.2.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/1.2.0) (2018-09-11)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/1.1.0...1.2.0)

**Closed issues:**

- Add EVR message formatting to mirror Core functionality [\#85](https://github.com/NASA-AMMOS/AIT-GUI/issues/85)
- Telemetry monitoring greenlet exception raise regressed [\#84](https://github.com/NASA-AMMOS/AIT-GUI/issues/84)
- Command Browser requires subsystem attribute to function properly [\#82](https://github.com/NASA-AMMOS/AIT-GUI/issues/82)

**Merged pull requests:**

- Issue \#84 - Fix greenlet exception raise bug in telem monitoring code [\#87](https://github.com/NASA-AMMOS/AIT-GUI/pull/87) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#85 - Add support for EVR message formatting [\#86](https://github.com/NASA-AMMOS/AIT-GUI/pull/86) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#82 - Add commands without subsystem to default subsystem group [\#83](https://github.com/NASA-AMMOS/AIT-GUI/pull/83) ([MJJoyce](https://github.com/MJJoyce))

## [1.1.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/1.1.0) (2018-07-16)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/1.0.0...1.1.0)

**Closed issues:**

- Better handle KeyboardInterrupts in optional service greenlets [\#80](https://github.com/NASA-AMMOS/AIT-GUI/issues/80)
- Add database write integration [\#79](https://github.com/NASA-AMMOS/AIT-GUI/issues/79)
- Update out-of-limit message to include time [\#78](https://github.com/NASA-AMMOS/AIT-GUI/issues/78)
- Limit monitoring disables after limit trip [\#76](https://github.com/NASA-AMMOS/AIT-GUI/issues/76)
- Clean up messy widget docs [\#73](https://github.com/NASA-AMMOS/AIT-GUI/issues/73)
- Plots: title and y-title do not work [\#70](https://github.com/NASA-AMMOS/AIT-GUI/issues/70)
- Update package versions so npm ci is usable [\#68](https://github.com/NASA-AMMOS/AIT-GUI/issues/68)
- Add documentation for GUI widgets [\#47](https://github.com/NASA-AMMOS/AIT-GUI/issues/47)
- Update README with default contributing and community information [\#43](https://github.com/NASA-AMMOS/AIT-GUI/issues/43)
- Remove Contributing Guide from Sphinx docs [\#42](https://github.com/NASA-AMMOS/AIT-GUI/issues/42)
- Update CHANGELOG [\#40](https://github.com/NASA-AMMOS/AIT-GUI/issues/40)

**Merged pull requests:**

- Issue \#79 and \#80 - Data archiving and better interrupt handling [\#81](https://github.com/NASA-AMMOS/AIT-GUI/pull/81) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#76 - Remove greenlet exception raise bug in limit monitoring [\#77](https://github.com/NASA-AMMOS/AIT-GUI/pull/77) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#73 - Component docstring cleanup [\#74](https://github.com/NASA-AMMOS/AIT-GUI/pull/74) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#47 - Add GUI widget docs [\#71](https://github.com/NASA-AMMOS/AIT-GUI/pull/71) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#68 - Update Sinon package version so npm ci works [\#69](https://github.com/NASA-AMMOS/AIT-GUI/pull/69) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#43 - Update README with default contributing/community info [\#45](https://github.com/NASA-AMMOS/AIT-GUI/pull/45) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#42 - Remove contributing guide from Sphinx docs [\#44](https://github.com/NASA-AMMOS/AIT-GUI/pull/44) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#40 - Fix missing CHANGELOG releases [\#41](https://github.com/NASA-AMMOS/AIT-GUI/pull/41) ([MJJoyce](https://github.com/MJJoyce))

## [1.0.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/1.0.0) (2018-05-08)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/0.24.0...1.0.0)

**Closed issues:**

- Drop documentation upgrade scripts now that ReadTheDocs builds are up [\#37](https://github.com/NASA-AMMOS/AIT-GUI/issues/37)
- Add TravisCI build badge to README [\#34](https://github.com/NASA-AMMOS/AIT-GUI/issues/34)
- Add docs build badge to README [\#33](https://github.com/NASA-AMMOS/AIT-GUI/issues/33)
- Add CODEOWNERS file [\#31](https://github.com/NASA-AMMOS/AIT-GUI/issues/31)
- Setup build on Travis CI [\#28](https://github.com/NASA-AMMOS/AIT-GUI/issues/28)
- Switch AIT-GUI BLISS naming over to AIT [\#26](https://github.com/NASA-AMMOS/AIT-GUI/issues/26)
- Plots display GPS time instead of UTC time [\#25](https://github.com/NASA-AMMOS/AIT-GUI/issues/25)
- GUI Plot seems to drop packets [\#24](https://github.com/NASA-AMMOS/AIT-GUI/issues/24)
- Publish AIT GUI build to PyPi [\#16](https://github.com/NASA-AMMOS/AIT-GUI/issues/16)

**Merged pull requests:**

- Issue \#26 - Switch BLISS naming to AIT [\#39](https://github.com/NASA-AMMOS/AIT-GUI/pull/39) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#37 - Remove doc upgrade script [\#38](https://github.com/NASA-AMMOS/AIT-GUI/pull/38) ([lorsposto](https://github.com/lorsposto))
- Issue \#16 - Prepare to publish AIT GUI to Pypi [\#36](https://github.com/NASA-AMMOS/AIT-GUI/pull/36) ([lorsposto](https://github.com/lorsposto))
- Issue \#33 and \#34 - Add build badges to README [\#35](https://github.com/NASA-AMMOS/AIT-GUI/pull/35) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#31 - Add CODEOWNERS file [\#32](https://github.com/NASA-AMMOS/AIT-GUI/pull/32) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#25 - Update Plot time label and Search time handling [\#30](https://github.com/NASA-AMMOS/AIT-GUI/pull/30) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#28 - Setup Travis CI build [\#29](https://github.com/NASA-AMMOS/AIT-GUI/pull/29) ([MJJoyce](https://github.com/MJJoyce))

## [0.24.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/0.24.0) (2018-04-25)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/0.23.1...0.24.0)

**Closed issues:**

- Add telemetry limit monitoring and user notification support [\#22](https://github.com/NASA-AMMOS/AIT-GUI/issues/22)

**Merged pull requests:**

- Issue \#22 - Add telemetry limit monitoring and user notification support [\#23](https://github.com/NASA-AMMOS/AIT-GUI/pull/23) ([MJJoyce](https://github.com/MJJoyce))

## [0.23.1](https://github.com/NASA-AMMOS/AIT-GUI/tree/0.23.1) (2018-04-21)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/0.23.0...0.23.1)

**Closed issues:**

- Duplicate script execution from UI [\#20](https://github.com/NASA-AMMOS/AIT-GUI/issues/20)
- Messages timestamps are displayed as GPS time incorrectly [\#17](https://github.com/NASA-AMMOS/AIT-GUI/issues/17)

**Merged pull requests:**

- Issue \#20 - Fix duplicate script execution [\#21](https://github.com/NASA-AMMOS/AIT-GUI/pull/21) ([MJJoyce](https://github.com/MJJoyce))

## [0.23.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/0.23.0) (2018-04-19)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/0.22.0...0.23.0)

**Closed issues:**

- Fix installation line in index of docs [\#14](https://github.com/NASA-AMMOS/AIT-GUI/issues/14)
- Update README [\#11](https://github.com/NASA-AMMOS/AIT-GUI/issues/11)
- Get GUI docs built and publicly viewable [\#10](https://github.com/NASA-AMMOS/AIT-GUI/issues/10)

**Merged pull requests:**

- Issue \#17 - Update Messages datetime format call to use UTC time [\#18](https://github.com/NASA-AMMOS/AIT-GUI/pull/18) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#14 - Update index.rst of docs [\#15](https://github.com/NASA-AMMOS/AIT-GUI/pull/15) ([lorsposto](https://github.com/lorsposto))
- Issue \#10 - Publish AIT GUI docs to ReadTheDocs [\#13](https://github.com/NASA-AMMOS/AIT-GUI/pull/13) ([lorsposto](https://github.com/lorsposto))
- Issue \#11 - Update README [\#12](https://github.com/NASA-AMMOS/AIT-GUI/pull/12) ([lorsposto](https://github.com/lorsposto))

## [0.22.0](https://github.com/NASA-AMMOS/AIT-GUI/tree/0.22.0) (2018-04-11)
[Full Changelog](https://github.com/NASA-AMMOS/AIT-GUI/compare/0.21.0...0.22.0)

**Closed issues:**

- Clock tests fail after GPS additions [\#7](https://github.com/NASA-AMMOS/AIT-GUI/issues/7)
- Mnemonic search fails due to missing limits options [\#6](https://github.com/NASA-AMMOS/AIT-GUI/issues/6)
- Display GPS time as default Clock state [\#3](https://github.com/NASA-AMMOS/AIT-GUI/issues/3)
- Update index.html with better default examples [\#2](https://github.com/NASA-AMMOS/AIT-GUI/issues/2)
- Write script for dumping example data to UI for demonstrations [\#1](https://github.com/NASA-AMMOS/AIT-GUI/issues/1)

**Merged pull requests:**

- Issue \#7 - Fix missing default UTC option in format helpers [\#9](https://github.com/NASA-AMMOS/AIT-GUI/pull/9) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#6 - Fix membership check in search limit formatting [\#8](https://github.com/NASA-AMMOS/AIT-GUI/pull/8) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#1 and \#2 - Add better default GUI examples [\#5](https://github.com/NASA-AMMOS/AIT-GUI/pull/5) ([MJJoyce](https://github.com/MJJoyce))
- Issue \#3 - Add GPS time display to clock component [\#4](https://github.com/NASA-AMMOS/AIT-GUI/pull/4) ([MJJoyce](https://github.com/MJJoyce))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*