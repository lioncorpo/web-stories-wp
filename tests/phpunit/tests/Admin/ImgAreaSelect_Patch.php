<?php
/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories\Tests\Admin;

use Google\Web_Stories\Assets;
use Google\Web_Stories\Admin\ImgAreaSelect_Patch as Testee;
use Google\Web_Stories\Tests\Test_Case;

/**
 * Class ImgAreaSelect_Patch
 *
 * @package Google\Web_Stories\Tests\Admin
 *
 * @coversDefaultClass \Google\Web_Stories\Admin\ImgAreaSelect_Patch
 */
class ImgAreaSelect_Patch extends Test_Case {
	/**
	 * @covers ::register
	 */
	public function test_register() {
		$object = new Testee( new Assets() );
		$object->register();

		$this->assertSame( 10, has_filter( 'script_loader_tag', [ $object, 'script_loader_tag' ] ) );
	}

	/**
	 * @covers ::script_loader_tag
	 */
	public function test_script_loader_tag() {
		$assets = $this->getMockBuilder( Assets::class )->setMethods( [ 'get_asset_metadata', 'get_base_url' ] )->getMock();
		$assets->method( 'get_asset_metadata' )
			->willReturn(
				[
					'dependencies' => [],
					'version'      => '9.9.9',
					'js'           => [ 'fake_js_chunk' ],
					'css'          => [ 'fake_css_chunk' ],
				]
			);
		$assets->method( 'get_base_url' )->willReturn( 'http://www.google.com/foo.js' );
		$object = $this->getMockBuilder( Testee::class )->setConstructorArgs( [ $assets ] )->setMethods( [ 'is_edit_screen' ] )->getMock();
		$object->method( 'is_edit_screen' )->willReturn( true );
		$tag     = '<script src="http://www.example.com/foo.js"></script>';
		$results = $object->script_loader_tag( $tag, Testee::SCRIPT_HANDLE, 'http://www.example.com/foo.js' );
		$this->assertContains( '9.9.9', $results );
		$this->assertContains( 'http://www.google.com/foo.js', $results );
		$this->assertNotContains( 'http://www.example.com/foo.js', $results );
	}

	/**
	 * @covers ::script_loader_tag
	 */
	public function test_script_loader_tag_wrong_handle() {
		$object  = new Testee( new Assets() );
		$tag     = '<script src="http://www.example.com/foo.js"></script>';
		$results = $object->script_loader_tag( $tag, 'wrong-handle', 'http://www.example.com/foo.js' );
		$this->assertSame( $tag, $results );
	}

	/**
	 * @covers ::script_loader_tag
	 */
	public function test_script_loader_tag_not_editor() {
		$object  = new Testee( new Assets() );
		$tag     = '<script src="http://www.example.com/foo.js"></script>';
		$results = $object->script_loader_tag( $tag, Testee::SCRIPT_HANDLE, 'http://www.example.com/foo.js' );
		$this->assertSame( $tag, $results );
	}
}
