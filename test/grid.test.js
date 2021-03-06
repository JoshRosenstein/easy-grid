/**
 * Copyright 2017 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import grid from '../src/grid.js';

import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import React from 'react';
import { mount } from 'enzyme';
import 'jest-styled-components';


describe('The grid component should', () => {
	beforeAll(() => {
		Enzyme.configure({adapter: new Adapter()});
	})

	it('accept layout via interpolation', () => {
		const TwoByTwo = grid`
					1fr  2fr
			3fr A,B  A,B
			4fr A    A
		`;
	});

	it('throw on too many header row columns', () => {
		expect(() => {
			grid`
						1fr  2fr
				3fr A,B
				4fr A  
			`;
		}).toThrow(/headers row has too many columns/);
	});

	it('throw on non-uniform column lengths', () => {
		expect(() => {
			grid`
				    1fr
				1fr  A
				1fr
			`
		}).toThrow(/should have the same number of/);
	});

	it('be able to handle only column headers', () => {
		let Component = null;
		expect(() => {
			Component = grid`1fr 2fr 3fr`;
		}).not.toThrow();
		expect(Component.colHeaders).toEqual('1fr 2fr 3fr');
	});

	it('be able to handle only row headers', () => {
		let Component = null;
		expect(() => {
			Component = grid`
			1fr
			2fr 
			3fr`;
		}).not.toThrow();
		expect(Component.rowHeaders).toEqual('1fr 2fr 3fr');
	});

	it('produce a dimensions map', () => {
		const Component = grid`
						3fr   4fr
				1fr	A,B   A,B
				2fr A     A
			`;
		const areaDimensions = Component.extractedDimensions;
		expect(areaDimensions['A'].top).toBe(0);
		expect(areaDimensions['A'].left).toBe(0);
		expect(areaDimensions['A'].bottom).toBe(1);
		expect(areaDimensions['A'].right).toBe(1);

		expect(areaDimensions['B'].top).toBe(0);
		expect(areaDimensions['B'].left).toBe(0);
		expect(areaDimensions['B'].bottom).toBe(0);
		expect(areaDimensions['B'].right).toBe(1);

		expect(Component.colHeaders).toEqual('3fr 4fr');
		expect(Component.rowHeaders).toEqual('1fr 2fr');
	});

	it('assigns dimensions based on sorting', () => {
		const Component = grid`
						3fr   4fr
				1fr	A,B   A,B
				2fr A     A
			`;
		const wrapper = mount(
			<Component>
				<div></div>
				<div></div>
			</Component>
		);
		const gridComponent = wrapper.childAt(0).childAt(0);
		const firstGridItem = gridComponent.childAt(0).childAt(0);
		const secondGridItem = gridComponent.childAt(1).childAt(0);
		expect(firstGridItem).toHaveStyleRule('grid-row-start', '1');
		expect(firstGridItem).toHaveStyleRule('grid-row-end', '3');
		expect(firstGridItem).toHaveStyleRule('grid-column-start', '1');
		expect(firstGridItem).toHaveStyleRule('grid-column-end', '3');
		expect(secondGridItem).toHaveStyleRule('grid-row-start', '1');
		expect(secondGridItem).toHaveStyleRule('grid-row-end', '2');
		expect(secondGridItem).toHaveStyleRule('grid-column-start', '1');
		expect(secondGridItem).toHaveStyleRule('grid-column-end', '3');
	});

	it('assigns dimensions based on gridItem', () => {
		const Component = grid`
						3fr   4fr
				1fr	A,B   A,B
				2fr A     A
			`;
		const wrapper = mount(
			<Component>
				<div item="B"></div>
				<div item="A"></div>
			</Component>
		);
		const gridComponent = wrapper.childAt(0).childAt(0);
		const firstGridItem = gridComponent.childAt(0).childAt(0);
		const secondGridItem = gridComponent.childAt(1).childAt(0);
		expect(firstGridItem).toHaveStyleRule('grid-row-start', '1');
		expect(firstGridItem).toHaveStyleRule('grid-row-end', '2');
		expect(firstGridItem).toHaveStyleRule('grid-column-start', '1');
		expect(firstGridItem).toHaveStyleRule('grid-column-end', '3');
		expect(secondGridItem).toHaveStyleRule('grid-row-start', '1');
		expect(secondGridItem).toHaveStyleRule('grid-row-end', '3');
		expect(secondGridItem).toHaveStyleRule('grid-column-start', '1');
		expect(secondGridItem).toHaveStyleRule('grid-column-end', '3');
	});

	it('support empty cells', () => {
		const Component = grid`
						3fr   4fr
				1fr	..   ..
				2fr A     A
			`;
		const areaDimensions = Component.extractedDimensions;
		expect(areaDimensions['A'].top).toBe(1);
		expect(areaDimensions['A'].left).toBe(0);
		expect(areaDimensions['A'].bottom).toBe(1);
		expect(areaDimensions['A'].right).toBe(1);

		expect(Component.colHeaders).toEqual('3fr 4fr');
		expect(Component.rowHeaders).toEqual('1fr 2fr');
	});
});